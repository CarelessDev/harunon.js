import { Context } from "cocoa-discord-utils";
import { Awaitable } from "cocoa-discord-utils/internal/base";

import { GuildMember, VoiceChannel } from "discord.js";

import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    getVoiceConnection,
    joinVoiceChannel as libJoinVoiceChannel,
    VoiceConnectionStatus,
} from "@discordjs/voice";

import { getAllAudioUrls } from "google-tts-api";
import { IncomingMessage } from "http";
import https from "https";
import ytdl from "ytdl-core";

export interface Music {
    url: string;
}

export namespace Voice {
    export const music_queues: { [guildId: string]: Music } = {};

    /**
     * Joins to the channel if not already in one.
     */
    export async function joinFromContext(ctx: Context) {
        const connection = getVoiceConnection(ctx.guildId!);
        if (connection?.state.status == VoiceConnectionStatus.Ready) return;

        const voiceChannel = (ctx.member as GuildMember | undefined)?.voice
            .channel as VoiceChannel;
        if (!voiceChannel) return;

        await Voice.joinVoiceChannel(voiceChannel);
    }

    export async function joinVoiceChannel(
        channel: VoiceChannel,
        onDisconnect?: () => Awaitable<void>
    ) {
        const connection = libJoinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfMute: false,
        });

        connection.on(VoiceConnectionStatus.Disconnected, async (_, __) => {
            try {
                await Promise.race([
                    entersState(
                        connection,
                        VoiceConnectionStatus.Signalling,
                        5_000
                    ),
                    entersState(
                        connection,
                        VoiceConnectionStatus.Connecting,
                        5_000
                    ),
                ]);
                // Seems to be reconnecting to a new channel - ignore disconnect
            } catch (error) {
                // Seems to be a real disconnect which SHOULDN'T be recovered from
                connection.destroy();
                await onDisconnect?.();
            }
        });

        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
            return connection;
        } catch (err) {
            return undefined;
        }
    }

    export function playMusic(guildId: string, url: string) {
        const connection = getVoiceConnection(guildId);
        if (!connection) return false;

        const audioPlayer = createAudioPlayer();
        connection.subscribe(audioPlayer);

        const stream = ytdl(url, {
            filter: "audioonly",
            quality: "highestaudio",
            highWaterMark: 1 << 25,
            liveBuffer: 4000,
        });

        const resource = createAudioResource(stream);
        audioPlayer.play(resource);

        return new Promise<boolean>((resolve, _) => {
            audioPlayer.on(AudioPlayerStatus.Idle, () => {
                audioPlayer.stop();
                console.log("MUSIC DONE");
                resolve(true);
            });
            audioPlayer.on("error", (_) => {
                audioPlayer.stop();
                console.log("MUSIC FAIL");
                resolve(false);
            });
        });
    }

    export async function speak(
        guildId: string,
        text: string,
        lang?: string | null
    ) {
        const connection = getVoiceConnection(guildId);
        if (!connection) return false;

        const urls = getAllAudioUrls(text, { lang: lang ?? "th", slow: false });

        const streams = await Promise.all(
            urls.map(async (url) =>
                createAudioResource(
                    await new Promise<IncomingMessage>((res, _) => {
                        https.get(url.url, (stream) => {
                            res(stream);
                        });
                    })
                )
            )
        );

        const audioPlayer = createAudioPlayer();
        connection.subscribe(audioPlayer);

        audioPlayer.play(streams[0]);
        let next = 1;

        return new Promise<boolean>((resolve, _) => {
            audioPlayer.on(AudioPlayerStatus.Idle, () => {
                if (next < streams.length) {
                    audioPlayer.play(streams[next]);
                    next++;
                } else {
                    audioPlayer.stop();
                    resolve(true);
                }
            });
            audioPlayer.on("error", (_) => {
                audioPlayer.stop();
                resolve(false);
            });
        });
    }
}
