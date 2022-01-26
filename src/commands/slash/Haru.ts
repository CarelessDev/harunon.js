import { TextChannel } from "discord.js";
import { CocoaSlash, Cog } from "cocoa-discord-utils/slash";
import { CocoaBuilder, ephemeral } from "cocoa-discord-utils/template";

const ping: CocoaSlash = {
    command: CocoaBuilder("ping", "Pong Tai!")
        .addBooleanOption(ephemeral("Reduce mess caused to channel"))
        .toJSON(),
    func: async (ctx) => {
        const e = ctx.options.getBoolean("ephemeral") ?? false;
        const interval = new Date().getTime() - ctx.createdAt.getTime();
        await ctx.reply({
            content: `Pong! Ping = ${Math.round(interval)} ms`,
            ephemeral: e ?? false,
        });
    },
};

const blep: CocoaSlash = {
    command: CocoaBuilder("blep", "No one have idea what command is this")
        .addUserOption((option) =>
            option
                .setName("person")
                .setDescription("Who you want to B L E P")
                .setRequired(true)
        )
        .toJSON(),
    func: async (ctx) => {
        const person = ctx.options.getUser("person", true);
        await ctx.reply(person.avatarURL() ?? "Can't blep, no avatar");
    },
};

const kamui: CocoaSlash = {
    command: CocoaBuilder(
        "kamui",
        "Clear Messages to delete what you have done"
    )
        .addIntegerOption((option) =>
            option
                .setName("clear_amount")
                .setDescription("clear_amount")
                .setRequired(true)
        )
        .toJSON(),
    func: async (ctx) => {
        const amount = ctx.options.getInteger("clear_amount", true);

        if (ctx.channel instanceof TextChannel) {
            await ctx.reply("**ザ・ハンドが消す!!!**");
            await ctx.channel.bulkDelete(amount + 1);

            await ctx.reply(`ザ・ハンドが**${amount}メッセージ**を消した!!!`);
            await ctx.channel?.send(
                "https://c.tenor.com/xexSk5SQBbAAAAAC/discord-mod.gif"
            );
        } else await ctx.reply("bruh, this don't work here");
    },
};

export const Haru: Cog = {
    name: "Haru",
    description: "Main Cog",
    commands: {
        ping,
        blep,
        kamui,
    },
};
