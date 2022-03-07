import * as fsSync from "fs";
import fs from "fs/promises";

export function listsAllLyricsSync() {
    return fsSync.readdirSync("data/lyrics");
}

export function CommandChoice() {
    const all = listsAllLyricsSync();
    return all.map((fname) => {
        const tokens = fname.split(".");
        const rfn = tokens.slice(0, tokens.length - 1).join(".");
        return [rfn, rfn] as [string, string];
    });
}

export interface Lyric {
    title: string;
    content: string;
    img?: string;
}

export function parseArg(
    content: string[]
): [{ [key: string]: string }, string] {
    const arg: { [key: string]: string } = {};

    let i = 0;
    for (; i < content.length; i++) {
        const tokens = content[i].split(":");
        if (tokens.length >= 2) {
            arg[tokens[0].trim()] = tokens.slice(1).join(":").trim();
        } else {
            break;
        }
    }

    return [arg, content.slice(i).join("\n")];
}

export async function getLyric(key: string): Promise<Lyric> {
    const buf = await fs.readFile(`data/lyrics/${key}.txt`);
    const lyric = buf.toString();

    const [arg, content] = parseArg(lyric.split("\n"));

    const title = `${arg.quote == "cn" ? "「" : '"'}${arg.name ?? "Unknown"}${
        arg.quote == "cn" ? "」" : '"'
    } — ${arg.artist ?? "Unknown"}`;

    return {
        title,
        content,
        img: arg.img,
    };
}