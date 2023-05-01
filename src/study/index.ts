import Discord from "../discord/index.js";
import User from "../user/index.js";
import Notion from "../notion/index.js";

interface IStudySession {
  pageId: string;
  startTime: Date;
  endTime: Date | null;
  isEarlyEnded: boolean;
  restTime: Date | null;
  totalRestTime: number;
}

class StudySession implements IStudySession {
  pageId: string;
  startTime: Date;
  endTime: Date | null;
  isEarlyEnded: boolean;
  restTime: Date | null;
  totalRestTime: number;

  constructor(pageId: string, startTime: Date) {
    this.pageId = pageId;
    this.startTime = startTime;
    this.endTime = null;
    this.isEarlyEnded = false;
    this.restTime = null;
    this.totalRestTime = 0;
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

export default class Study {
  private static sessionMap: Map<string, StudySession> = new Map();

  public static async start(userId: string) {
    const name = User.getName(userId);
    const duration = User.getDuration(userId) * 60 * 1000;
    const notion = User.getNotionUser(userId);
    const botChannel = Discord.botChannel;
    botChannel.send(`@everyone ${name} 님이 입장`);

    let studySession: StudySession | undefined = this.sessionMap.get(userId);
    const now = new Date();
    let page: any;
    if (
      studySession === undefined ||
      !studySession.endTime ||
      now.getTime() - studySession.endTime.getTime() > duration // if the time passed enough since the user finished their study session
    ) {
      try {
        page = await Notion.createStudyPage(name, notion.id, now);
        if (!page) {
          return;
        }
      } catch (error: any) {
        console.error(
          `src/study/index.ts::startStudy(${userId}) > ${error.code}: ${error.message}`
        );
        return;
      }
      studySession = new StudySession(page.id, now);
      this.sessionMap.set(userId, studySession);
    } else if (studySession.isEarlyEnded) {
      studySession.isEarlyEnded = false;
      await Notion.restorePage(studySession.pageId);
    }
  }

  public static async end(userId: string) {
    const studySession: StudySession | undefined = this.sessionMap.get(userId);
    if (studySession === undefined) {
      return;
    }
    const duration = User.getDuration(userId) * 60 * 1000;
    const now = new Date();
    if (studySession.isRest()) {
      studySession.endRest(now);
    }
    studySession.endTime = now;
    if (now.getTime() - studySession.startTime.getTime() <= duration) {
      // too short study session - ignore
      studySession.isEarlyEnded = true;
      try {
        await Notion.deleteBlock(studySession.pageId);
      } catch (error) {
        console.error(`Fail to delete page ${studySession.pageId}`, error);
        this.sessionMap.delete(userId);
      }
      return;
    }
    try {
      await Notion.updateEnd(
        studySession.pageId,
        now,
        studySession.totalRestTime
      );
    } catch (error: any) {
      console.error(
        `src/study/index.ts::endStudy(${userId}) ${error.code}: ${error.message}`
      );
      if (error.status === 400) {
        // notion page is deleted before the user finishes their study session
        this.sessionMap.delete(userId);
      }
    }
  }

  public static rest(userId: string) {
    const studySession = this.sessionMap.get(userId);
    if (studySession === undefined) {
      return undefined;
    }
    const now = new Date();
    if (studySession.isRest()) {
      studySession.endRest(now);
      return false;
    } else {
      studySession.startRest(now);
      return true;
    }
  }

  // private static isRest(studySession: StudySession) {
  //   return !!studySession.restTime;
  // }

  // private static startRest(studySession: StudySession, now: Date) {
  //   studySession.restTime = now;
  // }

  // private static endRest(studySession: StudySession, now: Date) {
  //   studySession.totalRestTime +=
  //     now.getMinutes() - studySession.restTime!.getMinutes();
  //   studySession.restTime = null;
  // }

  showRank() {
    // TODO
  }
}
