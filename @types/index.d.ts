declare module "discord-study-bot" {
  import {
    Awaitable,
    ClientEvents,
    Interaction,
    SlashCommandBuilder,
    User as DiscordUser,
  } from "discord.js";
  import {
    CreatePageParameters,
    CreatePageResponse,
    DeleteBlockParameters,
    DeleteBlockResponse,
    PersonUserObjectResponse as NotionUser,
    UpdatePageParameters,
    UpdatePageResponse,
  } from "@notionhq/client/build/src/api-endpoints";

  // Discord
  export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: Interaction) => Awaitable<void>;
  }

  export interface Event {
    name: keyof ClientEvents;
    listener: (...args: ClientEvents[keyof ClientEvents]) => Awaitable<void>;
  }

  // Notion
  export type WithAuth<P> = P & {
    auth?: string;
  };

  export type NotionAPIResponseType =
    | CreatePageResponse
    | UpdatePageResponse
    | DeleteBlockResponse;

  export type NotionAPIRequestType =
    | CreatePageParameters
    | UpdatePageParameters
    | DeleteBlockParameters;

  // User
  export type Name = string;
  export type Duration = number;

  export { DiscordUser, NotionUser };
}

// User {
//   name: "홍길동",  // 본명
//   duration: 5,
//   discord: {
//     id: '123456789012345678',
//     bot: false,
//     system: false,
//     flags: UserFlagsBitField { bitfield: 0 },
//     username: 'gildonghong',
//     discriminator: '1234',  // discord tag
//     avatar: null,
//     banner: undefined,
//     accentColor: undefined
//   },
//   notion: {
//     "object": "user",
//     "id": "d40e767c-d7af-4b18-a86d-55c61f1e39a4",
//     "type": "person",
//     "person": {
//       "email": "avo@example.org",
//     },
//     "name": "길동 홍",
//     "avatar_url": "https://secure.notion-static.com/e6a352a8-8381-44d0-a1dc-9ed80e62b53d.jpg",
//   }
// }
