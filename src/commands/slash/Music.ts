import { CogSlashClass, SlashCommand } from "cocoa-discord-utils/slash/class";
import { AutoBuilder, CocoaOption } from "cocoa-discord-utils/template";

import {
    Awaitable,
    CommandInteraction,
    Client,
    MessageActionRow,
    MessageSelectMenu,
    SelectMenuInteraction,
} from "discord.js";

import chalk from "chalk";
import { v4 as uuid } from "uuid";
import { videoInfo } from "ytdl-core";

import { style } from "../shared";
import { Voice, Music as IMusic } from "../shared/voice";

export class Music extends CogSlashClass {
    private client: Client;

    private selectMenuHandler?: (i: SelectMenuInteraction) => Awaitable<void>;

    constructor(client: Client) {
        super("Music", "DJ Harunon 参上!");
        this.client = client;

        client.on("interactionCreate", (interaction) => {
            if (interaction.isSelectMenu()) {
                this.selectMenuHandler?.(interaction);
            }
        });
    }

    private parseLength(seconds: number) {
        const minutes = Math.floor(seconds / 60);

        seconds %= 60;

        return `${minutes}:${seconds >= 10 ? `${seconds}` : `0${seconds}`}`;
    }

    /** Only works for positive number */
    private beautifyNumber(
        n: number | string | undefined | null,
        fallback = "Unknown"
    ) {
        if ((n ?? undefined) == undefined) return fallback;

        n = "" + n;

        let res = "";

        for (let i = 0; i < n.length; i++) {
            if ((n.length - i) % 3 == 0) {
                res += " ";
            }
            res += n[i];
        }

        return res.trim();
    }

    private musicEmbed(ctx: CommandInteraction, fullmeta: videoInfo) {
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
                    name: "🎙️Author",
                    value: `[${meta.author}](${metalong.author.channel_url})`,
                },
                {
                    name: "🧑Subscribers",
                    value: this.beautifyNumber(
                        metalong.author.subscriber_count
                    ),
                },
                {
                    name: "⌛Duration",
                    value: meta.isLiveContent
                        ? "LIVE"
                        : this.parseLength(+meta.lengthSeconds),
                },
                {
                    name: "🎫Requested By",
                    value: `<@${ctx.user.id}>`,
                },
                {
                    name: "👁️Watch",
                    value: this.beautifyNumber(meta.viewCount),
                },
                {
                    name: "👍Like",
                    value: this.beautifyNumber(metalong.likes),
                }
            );

        return emb;
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

        const emb = this.musicEmbed(ctx, fullmeta);

        await ctx.followUp({ embeds: [emb] });
    }

    @SlashCommand(
        AutoBuilder("Search Musics").addStringOption(
            CocoaOption("song", "What to search", true)
        )
    )
    async search(ctx: CommandInteraction) {
        const song = ctx.options.getString("song", true);

        await ctx.deferReply();

        const songs = await Voice.searchVideo(song);

        let text = "";
        const ss = songs.slice(0, 10);

        for (let i = 0; i < ss.length; i++) {
            text += `**${i + 1})** ${ss[i].title} [${ss[i].duration_raw}]\n`;
        }

        const emb = style
            .use(ctx)
            .setTitle(`Search Results for **${song}**`)
            .setDescription(text || "NO RESULT");

        if (ss.length < 1) {
            await ctx.followUp({ embeds: [emb] });
            return;
        }

        const thisId = uuid().split("-")[0];

        const menu = new MessageSelectMenu()
            .setCustomId(thisId)
            .setPlaceholder("Select your Song")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
                ...ss.map((vid) => {
                    return {
                        label: `${vid.title} [${vid.duration_raw}]`,
                        description: "",
                        value: vid.link,
                    };
                })
            );

        const row = new MessageActionRow().addComponents(menu);

        this.selectMenuHandler = async (interaction) => {
            if (interaction.customId != thisId) {
                await interaction
                    .update({
                        content:
                            "This interaction is no longer tracked! Please create new one!",
                        components: [],
                    })
                    .catch((_) =>
                        console.log(
                            chalk.red(
                                `Unknown Select Menu Interaction and cannot update ${interaction.customId}`
                            )
                        )
                    );
            }

            await Voice.joinFromContext(ctx);
            const prom = Voice.addMusicToQueue(
                ctx.guildId!,
                interaction.values[0]
            );

            let newtext = "";
            for (let i = 0; i < ss.length; i++) {
                if (ss[i].link == interaction.values[0]) {
                    newtext += `**${i + 1}) ${ss[i].title} [${
                        ss[i].duration_raw
                    }]**\n`;
                } else {
                    newtext += `~~**${i + 1})** ${ss[i].title} [${
                        ss[i].duration_raw
                    }]~~\n`;
                }
            }

            this.selectMenuHandler = undefined;

            await interaction.update({
                embeds: [
                    emb.setDescription(newtext),
                    this.musicEmbed(ctx, await prom),
                ],
                components: [],
            });
        };

        await ctx.followUp({ embeds: [emb], components: [row] });
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
