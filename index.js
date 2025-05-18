const { BskyAgent } = require('@atproto/api');
const axios = require('axios');

// 환경변수에서 정보 읽기
const agent = new BskyAgent({ service: 'https://bsky.social' });
const username = process.env.BSKY_HANDLE;             // ex) your.handle.bsky.social
const password = process.env.BSKY_APP_PASSWORD;       // Bluesky 앱 비밀번호
const discordWebhookUrl = process.env.DISCORD_WEBHOOK; // 디스코드 웹훅 URL

async function main() {
  await agent.login({ identifier: username, password });

  const feed = await agent.getAuthorFeed({ actor: username, limit: 1 });
  const latestPost = feed.data.feed[0];

  const uri = latestPost.post.uri;
  const postId = uri.split('/').pop();
  const link = `https://bsky.app/profile/${username}/post/${postId}`;

  await axios.post(discordWebhookUrl, {
    content: `${link}`,
  });
}

main();
