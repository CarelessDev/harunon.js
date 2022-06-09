import { Music as MusicBase, Voice as LibVoice } from "@leomotors/music-bot";

import { FutureSlash } from "cocoa-discord-utils/slash/class";
import { AutoBuilder } from "cocoa-discord-utils/template";

import { CommandInteraction, Client } from "discord.js";

import * as fs from "fs/promises";

import { style } from "../shared";

let qualityLinks: { [key: string]: string };

// * Note: Extending Class Cog is not what you should do unless you know
// * underlying mechanics
export class Music extends MusicBase {
    constructor(client: Client) {
        super(client, style, "DJ Harunon 参上!");
    }

    @FutureSlash(async () => {
        qualityLinks = JSON.parse(
            (await fs.readFile("data/quality.json")).toString()
        );

        return AutoBuilder("Play quality musics").addStringOption((option) =>
            option
                .setName("quality")
                .setDescription("Quality musics to play")
                .setRequired(true)
                .addChoices(Object.keys(qualityLinks).map((k) => [k, k]))
        );
    })
    async quality(ctx: CommandInteraction) {
        await ctx.deferReply();

        const quality = ctx.options.getString(
            "quality",
            true
        ) as keyof typeof qualityLinks;

        await LibVoice.joinFromContext(ctx);
        const result = await LibVoice.addMusicToQueue(
            ctx.guildId!,
            qualityLinks[quality],
            ctx.user.id
        );

        if (result != "No results found") {
            const emb = this.musicEmbed(ctx, ctx.user.id, result);
            await ctx.followUp({ embeds: [emb] });
        } else {
            await ctx.followUp("Unexpected Error: Video not found");
        }
    }
}
