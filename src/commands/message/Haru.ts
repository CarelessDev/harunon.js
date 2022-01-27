import { Message } from "discord.js";

import {
    CogMessageClass,
    MessageCommand,
} from "cocoa-discord-utils/message/class";
import { getElapsed } from "cocoa-discord-utils/meta";

export class Haru extends CogMessageClass {
    timePinged = 0;

    constructor() {
        super("Haru", "Main Message Cog");
    }

    @MessageCommand({
        name: "ping",
        aliases: ["ing"],
        description: "Pong Tai!",
    })
    async ping(msg: Message, strp: string) {
        this.timePinged++;
        const interval = new Date().getTime() - msg.createdAt.getTime();
        await msg.reply(
            `Pong! Ping = ${getElapsed(msg.createdAt)} ms, pinged ${
                this.timePinged
            } times`
        );
    }
}
