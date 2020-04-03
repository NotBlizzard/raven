import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import randomcolor from "randomcolor";
import yt from "ytdl-core";
import User from "../models/User";

import qs from "qs";
import {
  RichEmbed,
  GuildMember,
  TextChannel,
  VoiceConnection,
  Message,
} from "discord.js";

export default {
  lastfm: {
    args: "lastfm <user> | lastfm link <user>",
    description: "gets last.fm of <user>, or link <user> to you",
    async use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): Promise<void> {
      const user = await User.findOrCreate(member.user.id);
      if (args.length > 1) {
        user.lastFmName = args[1];
        await user.save();
        channel.send(
          `Your Discord name is now updated to the LastFM account "${user.lastFmName}".`,
        );
      } else {
        const lastFmApiKey: string = process.env.RAVEN_LASTFM_API;
        const queryData = {
          method: "user.getrecenttracks",
          user: user.lastFmName,
          api_key: lastFmApiKey,
          format: "json",
          limit: "1",
        };
        const data: AxiosRequestConfig = {
          method: "GET",
          data: qs.stringify(queryData, {}),
          headers: {
            "User-Agent": "WhatIsABlizzard/Raven",
          },
          url: "https://ws.audioscrobbler.com/2.0/",
        };

        axios(data).then((res) => {
          const data: object = res.data.recenttracks.track[0];
          const embed = new RichEmbed()
            .setTitle(`${member.user.username}'s LastFM`)
            .setAuthor(member.user.username, member.user.avatarURL)
            .addField("Author", data["artist"]["#text"])
            .addField("Song", data["name"])
            .addField("Album", data["album"]["#text"])
            .setColor(randomcolor())
            .setThumbnail(data["image"][2]["#text"]);

          channel.send(embed);
        });
      }
    },
  },
  yt: {
    args: "yt <args>",
    description: "searches on youtube for a video with the <args>",
    use(
      member: GuildMember,
      channel: TextChannel,
      message: Message,
      args: string[],
    ): void {
      const requestData = {
        url: "https://www.googleapis.com/youtube/v3/search",
        params: {
          part: "snippet",
          q: args.join("+"),
          key: process.env.RAVEN_YOUTUBE,
        },
        headers: {
          Accept: "application/json",
        },
      };
      axios(requestData).then((res: AxiosResponse) => {
        const youtubeId = res.data.items[0];
        member.voiceChannel.join().then((i: VoiceConnection) => {
          const stream = yt(`https://www.youtube.com/${youtubeId.id.videoId}`, {
            filter: "audioonly",
          });
          const dispatcher = i.playStream(stream);
          dispatcher.on("speaking", () => member.voiceChannel.leave());
        });
      });
    },
  },
};