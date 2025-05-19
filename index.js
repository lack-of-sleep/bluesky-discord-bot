import { BskyAgent } from '@atproto/api';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const agent = new BskyAgent({ service: 'https://bsky.social' });

const username = process.env.BSKY_HANDLE;
const password = process.env.BSKY_APP_PASSWORD;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK;

async function main() {
  await agent.login({ identifier: username, password });

  // 최근 글 여러 개 가져오기
  const feed = await agent.getAuthorFeed({ actor: username, limit: 10 });
  const posts = feed.data.feed;

  // "답글이 아닌 글" (루트 게시물)만 필터링
  const rootPosts = posts.filter(post => !post.reply && !post.post.reply);

  if (rootPosts.length === 0) {
    console.log('루트 게시물이 없습니다.');
    return;
  }

  // 가장 최근 루트 게시물 선택
  const latestRootPost = rootPosts[0];

  const uri = latestRootPost.post.uri;
  const postId = uri.split('/').pop();
  const link = `https://bsky.app/profile/${username}/post/${postId}`;

  await axios.post(discordWebhookUrl, {
    content: `${link}`,
  });
}


