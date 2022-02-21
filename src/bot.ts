import "dotenv/config";

import { startTime } from "./utils/perf";

import {
    ActivityGroupLoader,
    setConsoleEvent,
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
mcenter.validateCommands();
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
scenter.validateCommands();
scenter.on("error", async (name, err, ctx) => {
    console.log(chalk.red(`Command ${name} just error!`));
    await ctx.reply(`あら？, Error Occured: ${err}`);
});

const activity = new ActivityGroupLoader("data/activities.json");

client.on("ready", (cli) => {
    console.log(
        chalk.cyan(
            `はるのん Ready! Logged in as ${cli.user.tag}, took ${Math.round(
                new Date().getTime() - startTime
            )} ms`
        )
    );
    scenter.syncCommands();
    useActivityGroup(client, activity);
});

client.login(process.env.DISCORD_TOKEN);

// * Console Zone
setConsoleEvent((cmd: string) => {
    if (cmd.startsWith("logout")) {
        client.destroy();
        console.log(chalk.cyan("Logged out Successfully!"));
        process.exit(0);
    }

    if (cmd.startsWith("reload")) {
        activity.reload();
        return;
    }

    console.log(
        chalk.yellow(`[Console WARN] Unknown Command ${cmd.split(" ")[0]}`)
    );
});
