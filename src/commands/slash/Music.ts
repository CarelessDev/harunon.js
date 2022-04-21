import { Music as MusicBase, Voice as LibVoice } from "@leomotors/music-bot";

import { SlashCommand } from "cocoa-discord-utils/slash/class";
import { AutoBuilder } from "cocoa-discord-utils/template";

import { CommandInteraction, Client } from "discord.js";

import { style } from "../shared";

// * Note: Extending Class Cog is not what you should do unless you know
// * underlying mechanics
export class Music extends MusicBase {
    constructor(client: Client) {
        super(client, style, "DJ Harunon 参上!");
    }

    static readonly qualityLinks = {
        mao: "https://www.youtube.com/watch?v=Yfu6G3f8Xxc",
        iheres10: "https://www.youtube.com/shorts/AdgJizF_kQM",
    };

    @SlashCommand(
        AutoBuilder("Play quality musics").addStringOption((option) =>
            option
                .setName("quality")
                .setDescription("Quality musics to play")
                .setRequired(true)
                .addChoices(Object.keys(Music.qualityLinks).map((k) => [k, k]))
        )
    )
    async quality(ctx: CommandInteraction) {
        await ctx.reply("👌");

        const quality = ctx.options.getString(
            "quality",
            true
        ) as keyof typeof Music.qualityLinks;

        await LibVoice.joinFromContext(ctx);
        await LibVoice.addMusicToQueue(
            ctx.guildId!,
            Music.qualityLinks[quality]
        );
    }
}
