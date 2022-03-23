import { CogSlashClass, SlashCommand } from "cocoa-discord-utils/slash/class";
import { AutoBuilder, CocoaOption } from "cocoa-discord-utils/template";

import { CommandInteraction } from "discord.js";

import { style } from "../shared";
import { Voice, Music as IMusic } from "../shared/voice";

export class Music extends CogSlashClass {
    constructor() {
        super("Music", "DJ Harunon 参上!");
    }

    private parseLength(seconds: number) {
        const minutes = Math.floor(seconds / 60);

        seconds %= 60;

        return `${minutes}:${seconds >= 10 ? `${seconds}` : `0${seconds}`}`;
    }

    @SlashCommand(
        AutoBuilder("Play a song!").addStringOption(
            CocoaOption("song", "Song to play", true)
        )
    )
    async play(ctx: CommandInteraction) {
        const song = ctx.options.getString("song", true);

        await ctx.deferReply();

        await Voice.joinFromContext(ctx);

        const fullmeta = await Voice.addMusicToQueue(ctx.guildId!, song);
        const meta = fullmeta.player_response.videoDetails;

        const metalong = fullmeta.videoDetails;

        const emb = style
            .use(ctx)
            .setTitle("Added to Queue")
            .setDescription(`[${meta.title}](${metalong.video_url})`)
            .setThumbnail(
                meta.thumbnail.thumbnails[meta.thumbnail.thumbnails.length - 1]
                    .url
            )
            .addInlineFields(
                {
                    name: "Author",
                    value: `[${meta.author}](${metalong.author.channel_url})`,
                },
                {
                    name: "Author Subscribers",
                    value: `${metalong.author.subscriber_count ?? "Unknown"}`,
                },
                {
                    name: "Duration",
                    value: meta.isLiveContent
                        ? "LIVE"
                        : this.parseLength(+meta.lengthSeconds),
                },
                {
                    name: "Requested By",
                    value: `<@${ctx.user.id}>`,
                },
                {
                    name: "Watch👁️",
                    value: meta.viewCount,
                },
                {
                    name: "Like👍",
                    value: `${metalong.likes ?? "Unknown"}`,
                }
            );

        await ctx.followUp({ embeds: [emb] });
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

        if (q?.length > 0) text += "**Queue**\n";

        for (const m of q ?? []) {
            text += this.musicToString(m) + "\n";
        }

        const emb = style
            .use(ctx)
            .setTitle("Music Queue")
            .setDescription(text || "**The Queue is Empty!**");

        await ctx.reply({ embeds: [emb] });
    }

    @SlashCommand(AutoBuilder("Skip the current song!"))
    async skip(ctx: CommandInteraction) {
        Voice.skipMusic(ctx.guildId!);

        await ctx.reply("⏩");
    }

    @SlashCommand(AutoBuilder("Clear all songs in the queue"))
    async clear(ctx: CommandInteraction) {
        Voice.clearMusicQueue(ctx.guildId!);

        await ctx.reply("Cleared!");
    }
}
