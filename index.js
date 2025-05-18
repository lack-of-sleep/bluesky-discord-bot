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

        if (!feed.data.feed || feed.data.feed.length === 0) {
            throw new Error("No posts found in the feed.");
        }

        const latestPost = feed.data.feed[0];
        const uri = latestPost.post.uri;
        const postId = uri.split('/').pop();
        const link = `https://bsky.app/profile/${username}/post/${postId}`;

        await axios.post(discordWebhookUrl, { content: `${link}` });
    } catch (error) {
        console.error("Error in main():", error.message);
        process.exit(1);
    }
}

main();
