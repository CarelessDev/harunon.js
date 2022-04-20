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
import { Haru, Kashi, Music, TTS } from "./commands/slash";

const client = new Client(DJCocoaOptions);

const mcenter = new MessageCenter(client, { prefixes: ["simp"] });
mcenter.addCogs(new HaruM());
mcenter.useHelpCommand(style);
mcenter.on("error", async (name, err, msg) => {
    console.log(chalk.red(`Command ${name} just error!`));
    await msg.reply(`あら？, Error Occured: ${err}`);
});

const scenter = new SlashCenter(client, process.env.GUILD_IDS?.split(","));
scenter.addCogs(new Haru(), new Kashi(), new Music(client), new TTS());
scenter.useHelpCommand(style);
scenter.on("error", async (name, err, ctx) => {
    console.log(chalk.red(`Command ${name} just error!`));
    await ctx.channel?.send(`あら？, Error Occured: ${err}`);
});

const activity = new ActivityGroupLoader("data/activities.json");

client.on("ready", (cli) => {
    console.log(
        chalk.cyan(
            `はるのん Ready! Logged in as ${cli.user.tag}, took ${process
                .uptime()
                .toFixed(3)} seconds`
        )
    );
    scenter.syncCommands();
    useActivityGroup(client, activity);
});

new ConsoleManager().useLogout(client).useReload(activity);

checkLogin(client, process.env.DISCORD_TOKEN);
