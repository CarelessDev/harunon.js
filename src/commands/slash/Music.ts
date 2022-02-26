import { CogSlashClass, SlashCommand } from "cocoa-discord-utils/slash/class";
import { AutoBuilder, CocoaOption } from "cocoa-discord-utils/template";

import { CommandInteraction } from "discord.js";

import { Voice } from "../shared/voice";

export class Music extends CogSlashClass {
    constructor() {
        super("Music", "DJ Harunon 参上!");
    }

    @SlashCommand(
        AutoBuilder("Play a song!")
            .addStringOption(CocoaOption("song", "Song to play", true))
            .toJSON()
    )
    async play(ctx: CommandInteraction) {
        const song = ctx.options.getString("song", true);

        await Voice.joinFromContext(ctx);

        await ctx.reply("Done!");

        await Voice.playMusic(ctx.guildId!, song);
    }
}
