import Discord from "../discord/index.js";
import User from "../user/index.js";
import Notion from "../notion/index.js";

interface StudySession {
  pageId: string;
  startTime: Date;
  endTime?: Date;
  isEarlyEnded?: boolean;
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
          return false;
        }
      } catch (error: any) {
        console.error(
          `src/study/index.ts::startStudy(${userId}) > ${error.code}: ${error.message}`
        );
        return false;
      }
      studySession = {
        pageId: page.id,
        startTime: now,
      };
      this.sessionMap.set(userId, studySession);
    } else if (studySession.isEarlyEnded) {
      studySession.isEarlyEnded = false;
      await Notion.restorePage(studySession.pageId);
    }
    return true;
  }

  public static async end(userId: string) {
    const studySession: StudySession | undefined = this.sessionMap.get(userId);
    if (studySession === undefined) {
      return false;
    }
    const duration = User.getDuration(userId) * 60 * 1000;
    const now = new Date();
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
      return false;
    }
    try {
      await Notion.updateEndTime(studySession.pageId, now);
    } catch (error: any) {
      console.error(
        `src/study/index.ts::endStudy(${userId}) ${error.code}: ${error.message}`
      );
      if (error.status === 400) {
        // notion page is deleted before the user finishes their study session
        this.sessionMap.delete(userId);
      }
      return false;
    }
    return true;
  }

  rest() {
    // TODO
  }

  showRank() {
    // TODO
  }
}
