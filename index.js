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

  const feed = await agent.getAuthorFeed({ actor: username, limit: 5 }); // 여러 개 불러오기
  const posts = feed.data.feed;

  // 퍼블릭 게시글 중 가장 최신 글 찾기
  const latestRootPost = posts.find(item => !item.post.reply);

  if (!latestRootPost) {
    console.log('퍼블릭(루트) 게시글이 없습니다.');
    return;
  }

  const uri = latestRootPost.post.uri;
  const postId = uri.split('/').pop();
  const link = `https://bsky.app/profile/${username}/post/${postId}`;

  await axios.post(discordWebhookUrl, {
    content: `${link}`,
  });
}

