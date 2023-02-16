import {
  createStudyPage,
  updateEndTime,
  deleteBlock,
  restorePage,
} from "./notion.js";
import { getName, getDuration, getNotionId } from "./setting.js";

const sessionMap = new Map();

export async function startStudy(user) {
  const userId = user.id;
  let studySession = sessionMap.get(userId);
  const duration = getDuration(userId) * 60 * 1000;
  const now = new Date();
  let page;
  if (
    studySession === undefined ||
    !studySession.endTime ||
    now - studySession.endTime > duration // if the time passed enough since the user finished their study session
  ) {
    page = await createStudyPage(getName(userId), getNotionId(userId), now);
    if (!page) {
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

export async function endStudy(user) {
  const userId = user.id;
  const studySession = sessionMap.get(userId);
  if (studySession === undefined) {
    return false;
  }

  const now = new Date();
  studySession.endTime = now;
  const duration = getDuration(userId) * 60 * 1000;
  if (now - studySession.startTime <= duration) {
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
  } catch (error) {
    if (error.status === 400) {
      console.error(`src/utils/study.js: ${error.code}: ${error.message}`);
      // notion page is deleted before the user finishes their study session
      sessionMap.delete(userId);
    }
    return false;
  }
  return true;
}
