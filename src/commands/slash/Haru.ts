import { CocoaBuildTime, CocoaVersion } from "cocoa-discord-utils/meta";
import { CogSlashClass, SlashCommand } from "cocoa-discord-utils/slash/class";
import {
    CocoaBuilder,
    CocoaOption,
    Ephemeral,
    getEphemeral,
    getStatusFields,
} from "cocoa-discord-utils/template";

import { Client, CommandInteraction, TextChannel } from "discord.js";

import fetch from "node-fetch";

import { style } from "../shared";

import { HelixError, makeHelix } from "./_helix";

export class Haru extends CogSlashClass {
    readonly client: Client;
    timePinged = 0;

    constructor(client: Client) {
        super("Haru", "Main Slash Cog");
        this.client = client;
    }

    @SlashCommand(
        CocoaBuilder("blep", "No one have idea what command is this")
            .addUserOption(
                CocoaOption("person", "Who do you want to B L E P", true)
            )
            .toJSON()
    )
    async blep(ctx: CommandInteraction) {
        const person = ctx.options.getUser("person", true);
        await ctx.reply(
            person.avatarURL({ size: 4096 }) ?? "Can't blep, no avatar"
        );
    }

    @SlashCommand(
        CocoaBuilder("helix", "Adenine Thymine Cytosine Guanine")
            .addStringOption(CocoaOption("text", "Text to Helix-ify", true))
            .toJSON()
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
        CocoaBuilder("gay", "Insult someone for being gae")
            .addUserOption(CocoaOption("gay", "who are gay"))
            .toJSON()
    )
    async gay(ctx: CommandInteraction) {
        const who = ctx.options.getUser("gay") ?? ctx.user;

        await ctx.reply(`<@${who.id}> is gay!`);
    }

    @SlashCommand(
        CocoaBuilder("imposter", "Use Harunon to speak anything")
            .addStringOption(
                CocoaOption("message", "Message for Harunon to Speak", true)
            )
            .toJSON()
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
        CocoaBuilder("ping", "Pong Tai!")
            .addBooleanOption(Ephemeral("Reduce mess caused to channel"))
            .toJSON()
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
            .setDescription(`Ping = ${this.client.ws.ping} ms`);

        await ctx.reply({ embeds: [emb], ephemeral: e });
    }

    @SlashCommand(
        CocoaBuilder("kamui", "Clear Messages to delete what you have done")
            .addIntegerOption(
                CocoaOption("clear_amount", "Amount to *kamui*", true)
            )
            .toJSON()
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
        CocoaBuilder("simp", "A Good Way to SIMP (Powered by Tenor)")
            .addStringOption(CocoaOption("waifu_name", "Who to SIMP", true))
            .addBooleanOption(Ephemeral("SIMP without anyone knowing"))
            .toJSON()
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
        CocoaBuilder("status", "Asking Haruno if she is fine")
            .addBooleanOption(Ephemeral())
            .toJSON()
    )
    async status(ctx: CommandInteraction) {
        const ephemeral = getEphemeral(ctx);

        const emb = style
            .use(ctx)
            .setTitle("Harunon's Status")
            .setDescription(
                `Harunon Bot Version: ${process.env.npm_package_version}\nCocoa Utils Version: ${CocoaVersion} / ${CocoaBuildTime}`
            )
            .addFields(...(await getStatusFields(ctx)))
            .setFooter({
                text: "Bot made by CarelessDev/oneesan-lover ❤️❤️❤️",
            });

        await ctx.reply({ embeds: [emb], ephemeral });
    }
}
