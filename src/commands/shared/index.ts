import { createEmbedStyle } from "cocoa-discord-utils";
import { getElapsed } from "cocoa-discord-utils/meta";

import { CommandInteraction, Message } from "discord.js";

export namespace Haruno {
    export const Color = 0x5a3844;
    export function Footer(ctx: CommandInteraction | Message) {
        return {
            text: `Action took ${getElapsed(
                ctx.createdAt
            )} ms・このハルノには夢がある ❄️`,
        };
    }
}

export const style = createEmbedStyle({
    author: "invoker",
    color: Haruno.Color,
    footer: (ctx) => Haruno.Footer(ctx),
});

export const AllGuilds = (process.env.DEV_GUILD_IDS?.split(",") ?? []).concat(
    process.env.PROD_GUILD_IDS?.split(",") ?? []
);
