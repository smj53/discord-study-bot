import Discord from "../discord/index.js";
import Notion from "../notion/index.js";
import { usersDatabaseId } from "../utils/index.js";
import { DiscordUser, NotionUser } from "../utils/types.js";

export default class User {
  private static users: User[];
  readonly name: string;
  readonly duration: number; // public?
  readonly discord: DiscordUser;
  readonly notion: NotionUser;

  public static init() {
    (async () => {
      const users: User[] = [];
      const response = await Notion.readDatabase(usersDatabaseId);

      for (const result of response.results as any[]) {
        const name: string = result.properties["이름"].title[0].plain_text;
        const duration: number = result.properties["duration"].number;

        const discordId: string =
          result.properties["discordId"].rich_text[0].plain_text;
        const discordUser: DiscordUser = await Discord.fetchUser(discordId);
        const notionUser: NotionUser = result.properties["사람"].people[0];

        const user = new User(name, duration, discordUser, notionUser);
        users.push(user);
      }

      this.users = users;
    })();
  }

  private constructor(
    name: string,
    duration: number,
    discordUser: DiscordUser,
    notionUser: NotionUser
  ) {
    this.name = name;
    this.duration = duration;
    this.discord = discordUser;
    this.notion = notionUser;
  }

  public static getName(discordId: string) {
    return this.findUserByDiscordId(discordId).name;
  }

  public static getDuration(discordId: string) {
    return this.findUserByDiscordId(discordId).duration;
  }

  public static getDiscordUser(discordId: string) {
    return this.findUserByDiscordId(discordId).discord;
  }

  public static getNotionUser(discordId: string) {
    return this.findUserByDiscordId(discordId).notion;
  }

  private static findUserByDiscordId(discordId: string) {
    const user = this.users.find((user) => user.discord.id === discordId);
    if (!user) {
      throw Error("Cannot find user by discord id");
    }
    return user;
  }
}
