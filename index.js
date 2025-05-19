import { BskyAgent } from '@atproto/api';
import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const agent = new BskyAgent({ service: 'https://bsky.social' });

const username = process.env.BSKY_HANDLE;
const password = process.env.BSKY_APP_PASSWORD;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK;

const recordPath = './last_sent.json';

async function main() {
  await agent.login({ identifier: username, password });

  // 최근 게시물 가져오기 (최대 30개)
  const feed = await agent.getAuthorFeed({ actor: username, limit: 30 });
  const posts = feed.data.feed;

  // 루트 게시물만 필터링 (답글 제외)
  const rootPosts = posts.filter(post =>
    post.post && !post.post.reply && !post.reply && !post.reason
  );

  // 마지막으로 전송한 게시물의 시간 불러오기
  let lastSentTime = 0;
  if (fs.existsSync(recordPath)) {
    const raw = fs.readFileSync(recordPath, 'utf-8');
    lastSentTime = JSON.parse(raw).lastSentTime || 0;
  }

  // 새로운 게시물만 필터링
  const newPosts = rootPosts.filter(post => {
    const createdAt = new Date(post.post.indexedAt).getTime();
    return createdAt > lastSentTime;
  });

  if (newPosts.length === 0) {
    console.log('보낼 새 게시물이 없습니다.');
    return;
  }

  // 오래된 글부터 순서대로 전송
  newPosts.sort((a, b) => new Date(a.post.indexedAt) - new Date(b.post.indexedAt));

  for (const post of newPosts) {
    const uri = post.post.uri;
    const postId = uri.split('/').pop();
    const link = `https://bsky.app/profile/${username}/post/${postId}`;

    await axios.post(discordWebhookUrl, {
      content: `${link}`,
    });

    console.log(`전송됨: ${link}`);
  }

  // 마지막 게시물 시간 기록
  const newest = newPosts[newPosts.length - 1];
  const newestTime = new Date(newest.post.indexedAt).getTime();
  fs.writeFileSync(recordPath, JSON.stringify({ lastSentTime: newestTime }, null, 2));
}

main();
