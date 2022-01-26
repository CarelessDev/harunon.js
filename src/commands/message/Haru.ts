import { CocoaMessage, CogMessage } from "cocoa-discord-utils/message";

const ping: CocoaMessage = {
    command: {
        name: "ping",
        description: "Pong Tai!",
    },
    func: async (ctx) => {
        const interval = new Date().getTime() - ctx.createdAt.getTime();
        await ctx.reply(`Pong! Ping = ${Math.round(interval)} ms`);
    },
};

export const Haru: CogMessage = {
    name: "Haru",
    description: "Main Cog",
    commands: {
        ping,
    },
};
