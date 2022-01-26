import {
    CogMessageClass,
    MessageCommand,
} from "cocoa-discord-utils/message/class";
import { Message } from "discord.js";

export class Haru extends CogMessageClass {
    timePinged = 0;

    constructor() {
        super("Haru", "Main Cog");
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
            `Pong! Ping = ${Math.round(interval)} ms, pinged ${
                this.timePinged
            } times`
        );
    }
}
