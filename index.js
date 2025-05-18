if (!username || !password || !discordWebhookUrl) {
    console.error('One or more required environment variables are missing.');
    process.exit(1);
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Starting the bot...');

const { BskyAgent } = require('@atproto/api');
const axios = require('axios');

// 환경변수에서 정보 읽기
const agent = new BskyAgent({ service: 'https://bsky.social' });
const username = process.env.BSKY_HANDLE;             // ex) your.handle.bsky.social
const password = process.env.BSKY_APP_PASSWORD;       // Bluesky 앱 비밀번호
const discordWebhookUrl = process.env.DISCORD_WEBHOOK; // 디스코드 웹훅 URL

async function main() {
  try {
    // Log in to Bluesky
    await agent.login({ identifier: username, password });

    // Fetch the latest feed
    const feed = await agent.getAuthorFeed({ actor: username, limit: 1 });

    if (!feed.data.feed || feed.data.feed.length === 0) {
      throw new Error("No posts available in the feed.");
    }

    const latestPost = feed.data.feed[0];

    const uri = latestPost.post.uri;
    const postId = uri.split('/').pop();
    const link = `https://bsky.app/profile/${username}/post/${postId}`;

    // Send the post to Discord
    await axios.post(discordWebhookUrl, {
      content: `${link}`, 
    });

    console.log("Post successfully sent to Discord.");
  } catch (error) {
    console.error("An error occurred:", error.message);
    process.exit(1); // Exit with a failure code
  }
}

main();
