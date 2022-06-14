import { Version as MusicVersion } from "@leomotors/music-bot/dist/config.g";

import { CocoaVersion } from "cocoa-discord-utils/meta";
import {
    CogSlashClass,
    SlashCommand,
    FutureSlash,
} from "cocoa-discord-utils/slash/class";
import {
    AutoBuilder,
    CocoaOption,
    Ephemeral,
    getEphemeral,
    getStatusFields,
} from "cocoa-discord-utils/template";

import { CommandInteraction, TextChannel } from "discord.js";

import fetch from "node-fetch";
import { createWriteStream } from "node:fs";

import { style } from "../shared";
import { exec } from "../shared/os";

import { HelixError, makeHelix } from "./_helix";

export class Haru extends CogSlashClass {
    timePinged = 0;

    constructor() {
        super("Haru", "Main Slash Cog");
    }

    @SlashCommand(
        AutoBuilder("No one have idea what command is this").addUserOption(
            CocoaOption("person", "Who do you want to B L E P", true)
        )
    )
    async blep(ctx: CommandInteraction) {
        const person = ctx.options.getUser("person", true);
        await ctx.reply(
            person.avatarURL({ size: 4096 }) ?? "Can't blep, no avatar"
        );
    }

    @SlashCommand(
        AutoBuilder("Send some Emoji!").addStringOption(
            CocoaOption("emoji_name", "Emoji to Echoes ACT 3!", true)
        )
    )
    async emoji(ctx: CommandInteraction) {
        const emoji_name = ctx.options.getString("emoji_name", true);

        await ctx.reply(`:${emoji_name}:`);
    }

    @SlashCommand(
        AutoBuilder("Adenine Thymine Cytosine Guanine").addStringOption(
            CocoaOption("text", "Text to Helix-ify", true)
        )
    )
    async helix(ctx: CommandInteraction) {
        const helix = ctx.options.getString("text", true);

        const res = makeHelix(helix);

        if (res == HelixError.ILLEGAL_CHAR) {
            await ctx.reply("Illegal String!");
            return;
        } else if (res == HelixError.ILLEGAL_LEN) {
            await ctx.reply("Please don't try to make me, I have family!");
            return;
        }

        await ctx.reply("Helix時間で～す！");
        for (const helix of res) {
            await ctx.channel?.send(helix);
        }
    }

    @SlashCommand(
        AutoBuilder("Insult someone for being gae").addUserOption(
            CocoaOption("gay", "who are gay")
        )
    )
    async gay(ctx: CommandInteraction) {
        const who = ctx.options.getUser("gay") ?? ctx.user;

        await ctx.reply(`<@${who.id}> is gay!`);
    }

    @FutureSlash(async () => {
        const frameLists = (await exec("golden-frame list")).stdout
            .split("\n")
            .slice(1)
            .filter((l) => l.length)
            .map((e) => e.split(" ")[0].trim())
            .map((e) => ({ name: e, value: e }));

        return AutoBuilder("Create Golden Frame")
            .addStringOption((option) =>
                option
                    .setName("frame")
                    .setDescription("Frame Name")
                    .setRequired(true)
                    .addChoices(...frameLists)
            )
            .addUserOption(CocoaOption("who", "Who to put in the golden frame"))
            .addAttachmentOption(
                CocoaOption("img", "Image to put in the frame")
            );
    })
    async goldenframe(ctx: CommandInteraction) {
        const frame = ctx.options.getString("frame", true);

        const target_user = ctx.options.getUser("who");

        const target_img = ctx.options.getAttachment("img");

        if (!target_user && !target_img) {
            await ctx.reply("Either user or image must be given!");
            return;
        }

        await ctx.deferReply();

        let url: string | null;
        if (target_user) {
            url = target_user.avatarURL({ size: 4096 });
            if (!url) {
                await ctx.followUp(
                    "Cannot G O L D E N F R A M E: Target user has no profile picture!"
                );
                return;
            }
        } else {
            url = target_img!.attachment.toString();
        }

        const res = await fetch(url);
        if (!res.body) {
            await ctx.followUp("Where is body? (Fetch Error)");
            return;
        }

        const stream = res.body.pipe(createWriteStream("input.png"));

        await new Promise<void>((res, rej) => {
            stream.on("close", () => {
                res();
            });
            stream.on("error", () => {
                rej();
            });
        });

        await exec(`golden-frame build ${frame} input.png --output=output.png`);

        await ctx.followUp({ files: ["output.png"] });
    }

    @SlashCommand(
        AutoBuilder("Use Harunon to speak anything").addStringOption(
            CocoaOption("message", "Message for Harunon to Speak", true)
        )
    )
    async imposter(ctx: CommandInteraction) {
        const message = ctx.options.getString("message", true);

        if (ctx.channel) {
            await ctx.reply({ content: "サプライズ成功!", ephemeral: true });
            await ctx.channel.send(`${message}`);
        } else {
            await ctx.reply({
                content: "サプライズ成功な～い!",
                ephemeral: true,
            });
        }
    }

    @SlashCommand(
        AutoBuilder("Pong Tai!").addBooleanOption(
            Ephemeral("Reduce mess caused to channel")
        )
    )
    async ping(ctx: CommandInteraction) {
        this.timePinged++;
        const e = ctx.options.getBoolean("ephemeral") ?? false;

        const emb = style
            .use(ctx)
            .setTitle("Pong! Tai")
            .addField({
                name: "Pinged since start",
                value: `${this.timePinged}`,
            })
            .setDescription(`Ping = ${ctx.client.ws.ping} ms`);

        await ctx.reply({ embeds: [emb.toJSON()], ephemeral: e });
    }

    @SlashCommand(
        AutoBuilder(
            "Clear Messages to delete what you have done"
        ).addIntegerOption(
            CocoaOption("clear_amount", "Amount to *kamui*", true)
        )
    )
    async kamui(ctx: CommandInteraction) {
        const amount = ctx.options.getInteger("clear_amount", true);

        if (ctx.channel instanceof TextChannel) {
            await ctx.reply("**ザ・ハンドが消す!!!**");
            await ctx.channel.bulkDelete(amount + 1);

            await ctx.channel.send(
                `ザ・ハンドが**${amount}メッセージ**を消した!!!`
            );
            await ctx.channel.send(
                "https://c.tenor.com/xexSk5SQBbAAAAAC/discord-mod.gif"
            );
        } else await ctx.reply("bruh, this doesn't work here");
    }

    @SlashCommand(
        AutoBuilder("A Good Way to SIMP (Powered by Tenor)")
            .addStringOption(CocoaOption("waifu_name", "Who to SIMP", true))
            .addBooleanOption(Ephemeral("SIMP without anyone knowing"))
    )
    async simp(ctx: CommandInteraction) {
        const waifu_name = ctx.options.getString("waifu_name", true);
        const ephemeral = ctx.options.getBoolean("ephemeral") ?? false;

        const res = await fetch(
            `https://g.tenor.com/v1/search?q=${waifu_name}&key=${process.env.TENOR_APIKEY}&limit=20`
        );
        const results = ((await res.json()) as { results: unknown[] }).results;

        const randomed = results[
            Math.floor(Math.random() * results.length)
        ] as {
            media: { gif: { url: string } }[];
        };

        await ctx.reply({ content: `${randomed.media[0].gif.url}`, ephemeral });
    }

    @SlashCommand(
        AutoBuilder("Asking Haruno if she is fine").addBooleanOption(
            Ephemeral()
        )
    )
    async status(ctx: CommandInteraction) {
        const ephemeral = getEphemeral(ctx);

        const emb = style
            .use(ctx)
            .setTitle("Harunon's Status")
            .setDescription(
                `Harunon Bot Version: ${process.env.npm_package_version}\nCocoa Utils Version: ${CocoaVersion}\n@leomotors/music-bot Version: ${MusicVersion}`
            )
            .addFields(await getStatusFields(ctx))
            .setFooter({
                text: "Bot made by CarelessDev/oneesan-lover ❤️❤️❤️",
            });

        await ctx.reply({ embeds: [emb.toJSON()], ephemeral });
    }

    formatTime(ms_timestamp: number) {
        const t = Math.round(ms_timestamp / 1000);

        return `<t:${t}> (<t:${t}:R>)`;
    }

    readonly fbiStyle = style.extends({ author: "bot" });

    @SlashCommand(
        AutoBuilder("Get Selected User Information").addUserOption(
            CocoaOption("user", "Target User", true)
        )
    )
    async fbi(ctx: CommandInteraction) {
        const user = ctx.options.getUser("user", true);

        const gmember = ctx.guild?.members.cache.get(user.id);

        const emb = this.fbiStyle
            .use(ctx)
            .setTitle(user.tag)
            .setDescription(
                `ID: ${user.id}${user.bot ? "\n🤖Beep Boop🤖" : ""}`
            )
            .setThumbnail(user.avatarURL() ?? user.defaultAvatarURL)
            .addField({
                name: "Created At",
                value: this.formatTime(user.createdTimestamp),
            });

        if (gmember?.joinedTimestamp) {
            emb.addField({
                name: "Joined At",
                value: this.formatTime(gmember.joinedTimestamp),
            });
        }

        await ctx.reply({ embeds: [emb.toJSON()] });
    }
}
