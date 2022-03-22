import { CogSlashClass, SlashCommand } from "cocoa-discord-utils/slash/class";
import { AutoBuilder, CocoaOption } from "cocoa-discord-utils/template";

import { CommandInteraction } from "discord.js";

import { style } from "../shared";
import { Voice, Music as IMusic } from "../shared/voice";

export class Music extends CogSlashClass {
    constructor() {
        super("Music", "DJ Harunon 参上!");
    }

    @SlashCommand(
        AutoBuilder("Play a song!").addStringOption(
            CocoaOption("song", "Song to play", true)
        )
    )
    async play(ctx: CommandInteraction) {
        const song = ctx.options.getString("song", true);

        await Voice.joinFromContext(ctx);

        await ctx.reply("Done!");

        Voice.addMusicToQueue(ctx.guildId!, song);
    }

    private musicToString(music: IMusic) {
        return `[${music.detail.title} - ${music.detail.author}](${music.url})`;
    }

    @SlashCommand(AutoBuilder("Prints out the Queue!"))
    async queue(ctx: CommandInteraction) {
        const q = Voice.music_queue[ctx.guildId!];

        let text = "";

        const now_playing = Voice.now_playing[ctx.guildId!];

        if (now_playing) {
            text = "**Now Playing**\n" + this.musicToString(now_playing) + "\n";
        }

        if (q.length > 0) text += "**Queue**\n";

        for (const m of q) {
            text += this.musicToString(m) + "\n";
        }

        const emb = style.use(ctx).setTitle("Music Queue").setDescription(text);

        await ctx.reply({ embeds: [emb] });
    }
}
