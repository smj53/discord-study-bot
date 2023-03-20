import Discord from "../discord/index.js";
import Notion from "../notion/index.js";
import { usersDatabaseId } from "../utils/index.js";
import { DiscordUser, Duration, Name, NotionUser } from "../utils/types.js";

export default class User {
  private static users: User[];
  readonly name: Name;
  readonly duration: Duration; // public?
  readonly discord: DiscordUser;
  readonly notion: NotionUser;

  public static async init(): Promise<void> {
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
  }

  private constructor(
    name: Name,
    duration: Duration,
    discordUser: DiscordUser,
    notionUser: NotionUser
  ) {
    this.name = name;
    this.duration = duration;
    this.discord = discordUser;
    this.notion = notionUser;
  }

  public static getName(discordId: string): Name {
    return this.findUserByDiscordId(discordId).name;
  }

  public static getDuration(discordId: string): Duration {
    return this.findUserByDiscordId(discordId).duration;
  }

  public static getDiscordUser(discordId: string): DiscordUser {
    return this.findUserByDiscordId(discordId).discord;
  }

  public static getNotionUser(discordId: string): NotionUser {
    return this.findUserByDiscordId(discordId).notion;
  }

  private static findUserByDiscordId(discordId: string): User {
    const user = this.users.find((user) => user.discord.id === discordId);
    if (!user) {
      throw Error("Cannot find user by discord id");
    }
    return user;
  }
}
