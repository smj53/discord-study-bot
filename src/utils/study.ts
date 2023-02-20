import {
  createStudyPage,
  updateEndTime,
  deleteBlock,
  restorePage,
} from "./notion.js";
import { getName, getDuration, getNotionId } from "./setting.js";

const sessionMap = new Map();

// TODO: move types to utils folder
interface StudySession {
  pageId: string;
  startTime: Date;
  endTime?: Date;
  isEarlyEnded?: boolean;
}

export async function startStudy(userId: string) {
  let studySession: StudySession | undefined = sessionMap.get(userId);
  const duration = getDuration(userId) * 60 * 1000;
  const now = new Date();
  let page: any;
  if (
    studySession === undefined ||
    !studySession.endTime ||
    now.getTime() - studySession.endTime.getTime() > duration // if the time passed enough since the user finished their study session
  ) {
    try {
      page = await createStudyPage(getName(userId), getNotionId(userId), now);
      if (!page) {
        return false;
      }
    } catch (error: any) {
      console.error(
        `src/utils/study.js::startStudy(${userId}) > ${error.code}: ${error.message}`
      );
      return false;
    }

    studySession = {
      pageId: page.id,
      startTime: now,
    };
    sessionMap.set(userId, studySession);
  } else if (studySession.isEarlyEnded) {
    studySession.isEarlyEnded = undefined;
    await restorePage(studySession.pageId);
  }

  return true;
}

export async function endStudy(userId: string) {
  const studySession: StudySession | undefined = sessionMap.get(userId);
  if (studySession === undefined) {
    return false;
  }

  const now = new Date();
  studySession.endTime = now;
  const duration = getDuration(userId) * 60 * 1000;
  if (now.getTime() - studySession.startTime.getTime() <= duration) {
    // too short study session - ignore
    studySession.isEarlyEnded = true;
    try {
      await deleteBlock(studySession.pageId);
    } catch (error) {
      console.error(`Fail to delete page ${studySession.pageId}`, error);
      sessionMap.delete(userId);
    }
    return false;
  }

  try {
    await updateEndTime(studySession.pageId, now);
  } catch (error: any) {
    console.error(
      `src/utils/study.js::endStudy(${userId}) ${error.code}: ${error.message}`
    );
    if (error.status === 400) {
      // notion page is deleted before the user finishes their study session
      sessionMap.delete(userId);
    }
    return false;
  }
  return true;
}
