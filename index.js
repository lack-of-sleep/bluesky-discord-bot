// index.js

// 로컬 개발을 위한 환경 변수 로드 (프로덕션 환경에서는 별도 설정)
require('dotenv').config();

// 환경 변수 로드
const username = process.env.BSKY_HANDLE;
const password = process.env.BSKY_APP_PASSWORD;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK;

// 필수 환경 변수 확인
if (!username || !password || !discordWebhookUrl) {
  console.error('One or more required environment variables are missing.');
  process.exit(1);
}

// 전역 예외 처리 설정
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Starting the Bluesky to Discord bot...');

const { BskyAgent } = require('@atproto/api');
const axios = require('axios');

// Bluesky 에이전트 생성
const agent = new BskyAgent({ service: 'https://bsky.social' });

async function main() {
  try {
    // Bluesky 로그인 시도
    await agent.login({ identifier: username, password });
    console.log('Logged in to Bluesky successfully.');

    // 최신 피드 가져오기
    const feed = await agent.getAuthorFeed({ actor: username, limit: 1 });
    if (!feed.data.feed || feed.data.feed.length === 0) {
      throw new Error('No posts available in the feed.');
    }

    // 최신 게시물 선택 및 링크 생성
    const latestPost = feed.data.feed[0];
    const postUri = latestPost.post.uri;
    const postId = postUri.split('/').pop();
    const link = `https://bsky.app/profile/${username}/post/${postId}`;
    console.log(`Latest post link: ${link}`);

    // Discord에 게시물 링크 전송
    await axios.post(discordWebhookUrl, { content: link });
    console.log('Post successfully sent to Discord.');
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();
