import { Client, Message } from "discord.js";

import {
    CogMessageClass,
    MessageCommand,
} from "cocoa-discord-utils/message/class";
import { Embed } from "@discordjs/builders";

import { Haruno } from "../shared";

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

        const emb = new Embed()
            .setAuthor({
                name: msg.author.tag,
                iconURL: msg.author.avatarURL() ?? "",
            })
            .setColor(Haruno.Color)
            .setTitle("Pong! Tai")
            .addField({
                name: "Pinged since start",
                value: `${this.timePinged}`,
            })
            .setDescription(`Ping = ${this.client.ws.ping} ms`)
            .setFooter({ text: Haruno.Footer(msg.createdAt) });

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
