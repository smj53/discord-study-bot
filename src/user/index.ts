import { CreatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import Discord from "../discord";
import Notion from "../notion";
import { usersDatabaseId } from "../utils";
import { DiscordUser, Duration, Name, NotionUser } from "discord-study-bot";

class StudySession {
  pageId: string;
  startTime: Date;
  endTime: Date | null;
  isEarlyEnded: boolean;
  restTime: Date | null;
  totalRestTime: number;

  constructor(pageId: string, startTime: Date) {
    this.pageId = pageId;
    this.startTime = startTime;
    this.restTime = null;
    this.endTime = null;
    this.isEarlyEnded = false;
    this.totalRestTime = 0;
  }

  public isEnded(duration: Duration, now: Date) {
    return !this.endTime || now.getTime() - this.endTime.getTime() > duration; // if the time passed enough since the user finished their study session
  }

  public isRest() {
    return !!this.restTime;
  }

  public startRest(now: Date) {
    this.restTime = now;
  }

  public endRest(now: Date) {
    this.totalRestTime += now.getTime() - this.restTime!.getTime();
    this.restTime = null;
  }
}

export default class User {
  private static users: Map<string, User>;
  readonly name: Name;
  readonly discord: DiscordUser;
  readonly notion: NotionUser;

  // duration set 할 때 분으로 입력하면 ms로 변경해서 저장할 수 있도록...
  // setter를 써보고 싶어서 사용했으나 굳이 이 형태가 아니어도 괜찮
  set duration(value: number) {
    this._duration = value * 60 * 1000;
  }
  get duration() {
    return this._duration;
  }

  studySession: StudySession | null;

  public static async init(): Promise<void> {
    const response = await Notion.readDatabase(usersDatabaseId);

    for (const result of response.results as any[]) {
      const name: string = result.properties["이름"].title[0].plain_text;
      const duration: number = result.properties["duration"].number;

      const discordId: string =
        result.properties["discordId"].rich_text[0].plain_text;
      const discordUser: DiscordUser = await Discord.fetchUser(discordId);
      const notionUser: NotionUser = result.properties["사람"].people[0];

      const user = new User(name, duration, discordUser, notionUser);
      this.users.set(discordId, user);
    }
  }

  private constructor(
    name: Name,
    private _duration: Duration,
    discordUser: DiscordUser,
    notionUser: NotionUser
  ) {
    this.name = name;
    this.discord = discordUser;
    this.notion = notionUser;
    this.studySession = null;
  }

  // 외부에서 유저객체를 찾아와서 user.method() 형태로 함수를 사용하기 위해 public으로 변경
  // 조금 복잡해지는 감이 있어 변경을 생각해보아야 할 듯(ex. voiceStateUpdate.ts에서 if-else 문에서 중복 코드 발생)
  public static findUserByDiscordId(discordId: string): User {
    const user = this.users.get(discordId);
    if (!user) {
      throw Error("Cannot find user by discord id");
    }
    return user;
  }

  // duration, name, notion id 등을 클래스 멤버 변수로 사용
  public async startStudy() {
    const botChannel = Discord.botChannel;
    botChannel.send(`@everyone ${this.name} 님이 입장`);

    const now = new Date();
    let page: CreatePageResponse;
    if (
      this.studySession === null ||
      this.studySession.isEnded(this.duration, now)
    ) {
      try {
        page = await Notion.createStudyPage(this.name, this.notion.id, now);
        if (!page) {
          return;
        }
      } catch (error: any) {
        console.error(
          `src/study/index.ts::startStudy() > ${error.code}: ${error.message}`
        );
        return;
      }
      this.studySession = new StudySession(page.id, now);
    } else if (this.studySession.isEarlyEnded) {
      this.studySession.isEarlyEnded = false;
      await Notion.restorePage(this.studySession.pageId);
    }
    this.studySession.endTime = null;
  }

  public async endStudy() {
    if (this.studySession === null) {
      return;
    }
    const now = new Date();
    if (this.studySession.isRest()) {
      this.studySession.endRest(now);
    }
    this.studySession.endTime = now;
    if (
      now.getTime() - this.studySession.startTime.getTime() <=
      this.duration
    ) {
      // too short study session - ignore
      this.studySession.isEarlyEnded = true;
      try {
        await Notion.deleteBlock(this.studySession.pageId);
      } catch (error) {
        console.error(`Fail to delete page ${this.studySession.pageId}`, error);
        this.studySession = null;
      }
      return;
    }
    try {
      await Notion.updateEnd(
        this.studySession.pageId,
        now,
        this.studySession.totalRestTime
      );
    } catch (error: any) {
      console.error(
        `src/study/index.ts::endStudy() ${error.code}: ${error.message}`
      );
      if (error.status === 400) {
        // notion page is deleted before the user finishes their study session
        this.studySession = null;
      }
    }
  }

  public rest() {
    const now = new Date();
    if (
      this.studySession === null ||
      this.studySession.isEnded(this.duration, now)
    ) {
      return undefined;
    }
    if (this.studySession.isRest()) {
      this.studySession.endRest(now);
      return false;
    } else {
      this.studySession.startRest(now);
      return true;
    }
  }
}
