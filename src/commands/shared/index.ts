import { getElapsed } from "cocoa-discord-utils/meta";

export namespace Haruno {
    export const Color = 0x5a3844;

    export function Footer(elapsed: Date) {
        return `Request took ${getElapsed(
            elapsed
        )} ms・このハルノには夢がある ❄️`;
    }
}
