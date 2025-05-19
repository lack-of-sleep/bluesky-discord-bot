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

  const feed = await agent.getAuthorFeed({ actor: username, limit: 5 }); // 최근 여러 글 조회
  const posts = feed.data.feed;

  // 단순히 '답글'만 제외
  const latestNonReplyPost = posts.find(post => !post.post.reply);

  if (!latestNonReplyPost) {
    console.log('전송할 퍼블릭 게시글이 없습니다.');
    return;
  }

  const uri = latestNonReplyPost.post.uri;
  const postId = uri.split('/').pop();
  const link = `https://bsky.app/profile/${username}/post/${postId}`;

  await axios.post(discordWebhookUrl, {
    content: `${link}`,
  });
}

main();
