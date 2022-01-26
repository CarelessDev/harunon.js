import { CommandInteraction, TextChannel } from "discord.js";

import { CogClass } from "cocoa-discord-utils/slash/class";
import { SlashCommand } from "cocoa-discord-utils/slash/class";
import { CocoaBuilder, ephemeral } from "cocoa-discord-utils/template";

export class Haru extends CogClass {
    timePinged = 0;

    constructor() {
        super("Haru", "Main Cog");
    }

    @SlashCommand(
        CocoaBuilder("ping", "Pong Tai!")
            .addBooleanOption(ephemeral("Reduce mess caused to channel"))
            .toJSON()
    )
    async ping(ctx: CommandInteraction) {
        this.timePinged++;
        const e = ctx.options.getBoolean("ephemeral") ?? false;
        const interval = new Date().getTime() - ctx.createdAt.getTime();
        await ctx.reply({
            content: `Pong! Ping = ${Math.round(interval)} ms, pinged ${
                this.timePinged
            } times`,
            ephemeral: e ?? false,
        });
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
}
