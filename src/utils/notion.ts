import { Client } from "@notionhq/client";
import { getCurrentKoreanTime, getKorISOString } from "../utils/time.js";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = "25684024fb2b498f962b6ee7abed223f";

export async function readDatabase() {
  const response = await notion.databases.query({
    database_id: databaseId,
    // filter: {},
    // sorts: [],
  });
}

/**
 * Create a study page in [notion](www.notion.so/25684024fb2b498f962b6ee7abed223f)
 * @param {string} name user who starts a study session
 * @param {string} notionUserId id of the user
 * @param {Date} startTime when the session is started
 * @returns
 */
export async function createStudyPage(
  name: string,
  notionUserId: string,
  startTime: Date
) {
  const korStartTime = getCurrentKoreanTime();
  const response = await createPage({
    parent: {
      type: "database_id",
      database_id: databaseId,
    },
    properties: {
      이름: {
        title: [
          {
            text: {
              content: `${
                korStartTime.getUTCMonth() + 1
              }/${korStartTime.getUTCDate()} ${name}`,
            },
          },
        ],
      },
      "시작 시간": {
        date: {
          start: getKorISOString(startTime),
          end: null,
        },
      },
      참여자: {
        // type: "people",
        people: [{ object: "user", id: notionUserId }],
      },
    },
  });

  return response;
}

/**
 * Update end time of the study notion page
 * @param {string} pageId page id of the notion page
 * @param {Date} endTime
 */
export async function updateEndTime(pageId: string, endTime: Date) {
  await updatePage({
    page_id: pageId,
    properties: {
      "종료 시간": {
        date: {
          start: getKorISOString(endTime),
          end: null,
        },
      },
    },
    archived: false,
  });
}

export async function deleteBlock(blockId: string) {
  await catchCommonError(notion.blocks.delete, { block_id: blockId });
}

export async function restorePage(pageId: string) {
  await updatePage({
    page_id: pageId,
    archived: false,
  });
}

async function createPage(obj: any) {
  return await catchCommonError(notion.pages.create, obj);
}

async function updatePage(obj: any) {
  await catchCommonError(notion.pages.update, obj);
}

async function catchCommonError(func: any, obj: any) {
  try {
    return await func(obj);
  } catch (error: any) {
    if (error.status === 401) {
      // invalid token key
      console.error(`src/utils/notion.js: ${error.code}: ${error.message}`);
    } else {
      throw error;
    }
  }
}
