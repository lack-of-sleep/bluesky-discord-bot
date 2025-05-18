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

const agent = new BskyAgent({ service: 'https://bsky.social' });
const username = process.env.BSKY_HANDLE;
const password = process.env.BSKY_APP_PASSWORD;
const discordWebhookUrl = process.env.DISCORD_WEBHOOK;

async function main() {
    try {
        await agent.login({ identifier: username, password });
        
        const feed = await agent.getAuthorFeed({ actor: username, limit: 1 });
        const latestPost = feed.data.feed[0];

        if (!latestPost) {
            console.error('No posts found in the feed.');
            return;
        }

        const uri = latestPost.post.uri;
        const postId = uri.split('/').pop();
        const link = `https://bsky.app/profile/${username}/post/${postId}`;

        await axios.post(discordWebhookUrl, {
            content: `${link}`, 
        });
        console.log('Post sent successfully to Discord.');
    } catch (error) {
        console.error('An error occurred:', error.message);
        console.error(error.stack);
    }
}

main();
