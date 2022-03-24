import { CogSlashClass, SlashCommand } from "cocoa-discord-utils/slash/class";
import { AutoBuilder, CocoaOption } from "cocoa-discord-utils/template";

import { CommandInteraction } from "discord.js";

import { AllGuilds } from "../shared";
import { Voice } from "../shared/voice";

export class TTS extends CogSlashClass {
    constructor() {
        super("TTS", "Harunon can speak!");
    }

    @SlashCommand(
        AutoBuilder("Speak!")
            .addStringOption(CocoaOption("text", "What to speak", true))
            .addStringOption(CocoaOption("lang", "Language")),
        AllGuilds
    )
    async speak(ctx: CommandInteraction) {
        const text = ctx.options.getString("text", true);
        const lang = ctx.options.getString("lang");

        await ctx.reply("わかります！");

        await Voice.joinFromContext(ctx);
        Voice.speak(ctx.guildId!, text, lang);
    }
}
