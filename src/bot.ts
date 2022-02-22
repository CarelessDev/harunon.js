import "dotenv/config";

import {
    ActivityGroupLoader,
    checkLogin,
    ConsoleManager,
    useActivityGroup,
} from "cocoa-discord-utils";
import { MessageCenter } from "cocoa-discord-utils/message";
import { SlashCenter } from "cocoa-discord-utils/slash";
import { DJCocoaOptions } from "cocoa-discord-utils/template";

import { Client } from "discord.js";

import chalk from "chalk";

import { Haru as HaruM } from "./commands/message";
import { style } from "./commands/shared";
import { Haru } from "./commands/slash";

const client = new Client(DJCocoaOptions);

const mcenter = new MessageCenter(client, { prefixes: ["simp"] });
mcenter.addCogs(new HaruM(client));
mcenter.useHelpCommand(style);
mcenter.on("error", async (name, err, msg) => {
    console.log(chalk.red(`Command ${name} just error!`));
    await msg.reply(`あら？, Error Occured: ${err}`);
});

const scenter = new SlashCenter(
    client,
    process.env.GUILD_IDS?.split(",") ?? []
);
scenter.addCogs(new Haru(client));
scenter.useHelpCommand(style);
scenter.on("error", async (name, err, ctx) => {
    console.log(chalk.red(`Command ${name} just error!`));
    await ctx.reply(`あら？, Error Occured: ${err}`);
});

const activity = new ActivityGroupLoader("data/activities.json");

client.on("ready", (cli) => {
    console.log(
        chalk.cyan(
            `はるのん Ready! Logged in as ${cli.user.tag}, took ${process
                .uptime()
                .toFixed(2)} ms`
        )
    );
    scenter.syncCommands();
    useActivityGroup(client, activity);
});

const Console = new ConsoleManager();
Console.useLogout(client).useReload(activity);

checkLogin(client, process.env.DISCORD_TOKEN);
