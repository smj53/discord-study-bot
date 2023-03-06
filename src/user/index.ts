import Discord from "../discord/index.js";
import Notion from "../notion/index.js";
import { usersDatabaseId } from "../utils/index.js";
import { DiscordUser, NotionUser, UserData } from "../utils/types.js";

export default class User {
  private static users: UserData[];
  readonly name: string;
  readonly duration: number; // public?
  readonly discord: DiscordUser;
  readonly notion: NotionUser;

  public static init() {
    (async () => {
      const users: UserData[] = [];
      const response = await Notion.readDatabase(usersDatabaseId);

      for (const result of response.results as any[]) {
        const name: string = result.properties["이름"].title[0].plain_text;
        const duration: number = result.properties["duration"].number;

        const discordId: string =
          result.properties["discordId"].rich_text[0].plain_text;
        const discordUser: DiscordUser = await Discord.fetchUser(discordId);
        const notionUser: NotionUser = result.properties["사람"].people[0];

        const user: UserData = {
          name: name,
          duration: duration,
          discord: discordUser,
          notion: notionUser,
        };
        users.push(user);
      }

      this.users = users;
    })();
  }

  constructor(discordId: string) {
    const user = User.users.find(
      (user) => user.discord.id === discordId
    ) as UserData;
    this.name = user.name;
    this.duration = user.duration;
    this.discord = user.discord;
    this.notion = user.notion;
  }
}
