import { BskyAgent } from '@atproto/api';
import axios from 'axios';
import fs from 'fs';

const agent = new BskyAgent({ service: 'https://bsky.social' });

const username = process.env.BSKY_HANDLE;
const password = process.env.BSKY_APP_PASSWORD;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK;

const recordPath = './last_sent.json';

async function main() {
  await agent.login({ identifier: username, password });

  // 최근 게시물 여러 개 가져오기
  const feed = await agent.getAuthorFeed({ actor: username, limit: 10 });
  const posts = feed.data.feed;

  // 🟡 "루트 게시물만 필터링": 답글은 제외
  const rootPosts = posts.filter(post => !post.post.reply);

  // 이미 보낸 URI 목록 불러오기
  let sentUris = [];
  if (fs.existsSync(recordPath)) {
    const raw = fs.readFileSync(recordPath, 'utf-8');
    sentUris = JSON.parse(raw).sentUris || [];
  }

  // 아직 보내지 않은 루트 게시물만
  const newPosts = rootPosts.filter(post => !sentUris.includes(post.post.uri));

  if (newPosts.length === 0) {
    console.log('보낼 새 게시물이 없습니다.');
    return;
  }

  // 오래된 글부터 순서대로 전송
  newPosts.reverse();

  for (const post of newPosts) {
    const uri = post.post.uri;
    const postId = uri.split('/').pop();
    const link = `https://bsky.app/profile/${username}/post/${postId}`;

    await axios.post(discordWebhookUrl, {
      content: `${link}`,
    });

    console.log(`전송됨: ${link}`);
    sentUris.push(uri);
  }

  // 기록 파일 업데이트
  fs.writeFileSync(recordPath, JSON.stringify({ sentUris }, null, 2));
}

main();
