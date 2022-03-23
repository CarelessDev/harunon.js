import { CogSlashClass, SlashCommand } from "cocoa-discord-utils/slash/class";
import {
    AutoBuilder,
    Ephemeral,
    getEphemeral,
} from "cocoa-discord-utils/template";

import { CommandInteraction } from "discord.js";

import { style } from "../shared";
import { CommandChoice, getLyric } from "../shared/kashi";

export class Kashi extends CogSlashClass {
    constructor() {
        super("Kashi", "Lyrics Related Cog");
    }

    @SlashCommand(
        AutoBuilder("Get Lyrics of the Song")
            .addStringOption((option) =>
                option
                    .setName("song")
                    .setDescription("Name of the song")
                    .setRequired(true)
                    .addChoices(CommandChoice())
            )
            .addBooleanOption(Ephemeral())
    )
    async lyric(ctx: CommandInteraction) {
        const song = ctx.options.getString("song", true);
        const ephemeral = getEphemeral(ctx);

        const { title, content, img } = await getLyric(song);

        const emb = style.use(ctx).setTitle(title).setDescription(content);
        if (img) emb.setThumbnail(img);

        await ctx.reply({ embeds: [emb], ephemeral });
    }
}
