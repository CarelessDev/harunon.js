import "dotenv/config";
import { startTime } from "./utils/perf";

import chalk from "chalk";
import { Client } from "discord.js";

import {
    ActivityGroupLoader,
    setConsoleEvent,
    useActivityGroup,
} from "cocoa-discord-utils";
import { MessageCenter } from "cocoa-discord-utils/message";
import { SlashCenter } from "cocoa-discord-utils/slash";
import { CocoaIntents } from "cocoa-discord-utils/template";

import { Haru as HaruM } from "./commands/message";
import { Haru } from "./commands/slash";

const client = new Client(CocoaIntents);

const mcenter = new MessageCenter(client, { prefixes: ["simp"] });
mcenter.addCogs(new HaruM(client));
mcenter.validateCommands();

const scenter = new SlashCenter(
    client,
    process.env.GUILD_IDS?.split(",") ?? []
);
scenter.addCogs(new Haru(client));
scenter.validateCommands();

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
