import * as fs from "fs";

export function getFrameListSync(): [string, string][] {
    const frame_list = fs.readdirSync("lib/golden-frame/assets");
    return frame_list.filter((f) => !f.endsWith(".json")).map((i) => [i, i]);
}
