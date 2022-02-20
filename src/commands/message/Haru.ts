/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    CogMessageClass,
    MessageCommand,
} from "cocoa-discord-utils/message/class";

import { Client, Message } from "discord.js";

import { Haruno, style } from "../shared";

export class Haru extends CogMessageClass {
    readonly client: Client;
    timePinged = 0;

    constructor(client: Client) {
        super("Haru", "Main Message Cog");
        this.client = client;
    }

    @MessageCommand({
        name: "ping",
        aliases: ["ing"],
        description: "Pong Tai!",
    })
    async ping(msg: Message, strp: string) {
        this.timePinged++;

        const emb = style
            .use(msg)
            .setTitle("Pong! Tai")
            .addField({
                name: "Pinged since start",
                value: `${this.timePinged}`,
            })
            .setDescription(`Ping = ${this.client.ws.ping} ms`);

        await msg.reply({ embeds: [emb.toJSON()] });
    }

    @MessageCommand({
        name: "gay",
        description: "Insult someone for being gay",
    })
    async gay(msg: Message, strp: string) {
        const who =
            strp.split(" ").filter((s) => s.length > 0)[0] ??
            `<@${msg.author.id}>`;

        await msg.channel.send(`${who} is gay!`);
    }
}
