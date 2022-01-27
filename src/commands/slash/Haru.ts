import { Client, CommandInteraction, TextChannel } from "discord.js";

import { CogClass, SlashCommand } from "cocoa-discord-utils/slash/class";
import { CocoaBuilder, ephemeral } from "cocoa-discord-utils/template";
import { Embed } from "@discordjs/builders";

import { Haruno } from "../shared";

export class Haru extends CogClass {
    readonly client: Client;
    timePinged = 0;

    constructor(client: Client) {
        super("Haru", "Main Slash Cog");
        this.client = client;
    }

    @SlashCommand(
        CocoaBuilder("ping", "Pong Tai!")
            .addBooleanOption(ephemeral("Reduce mess caused to channel"))
            .toJSON()
    )
    async ping(ctx: CommandInteraction) {
        this.timePinged++;
        const e = ctx.options.getBoolean("ephemeral") ?? false;

        const emb = new Embed()
            .setAuthor({
                name: ctx.user.tag,
                iconURL: ctx.user.avatarURL() ?? "",
            })
            .setColor(Haruno.Color)
            .setTitle("Pong! Tai")
            .addField({
                name: "Pinged since start",
                value: `${this.timePinged}`,
            })
            .setDescription(`Ping = ${this.client.ws.ping} ms`)
            .setFooter({ text: Haruno.Footer(ctx.createdAt) });

        await ctx.reply({ embeds: [emb.toJSON()], ephemeral: e });
    }

    @SlashCommand(
        CocoaBuilder("blep", "No one have idea what command is this")
            .addUserOption((option) =>
                option
                    .setName("person")
                    .setDescription("Who you want to B L E P")
                    .setRequired(true)
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
        CocoaBuilder("kamui", "Clear Messages to delete what you have done")
            .addIntegerOption((option) =>
                option
                    .setName("clear_amount")
                    .setDescription("clear_amount")
                    .setRequired(true)
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
        CocoaBuilder("gay", "Insult someone for being gae")
            .addUserOption((option) =>
                option.setName("gay").setDescription("who are gay")
            )
            .toJSON()
    )
    async gay(ctx: CommandInteraction) {
        const who = ctx.options.getUser("gay") ?? ctx.user;

        await ctx.reply(`<@${who.id}> is gay!`);
    }

    @SlashCommand(
        CocoaBuilder("imposter", "Use Harunon to speak anything")
            .addStringOption((option) =>
                option
                    .setName("message")
                    .setDescription("Message for Harunon to Speak")
                    .setRequired(true)
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
}
