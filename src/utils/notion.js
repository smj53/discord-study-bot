import { Client } from "@notionhq/client";
import { getCurrentKoreanTime, getKorISOString } from "../utils/time.js";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = "d1b28a88d286408a923301b3d82a30de";

export async function readDatabase() {
  const response = await notion.databases.query({
    database_id: databaseId,
    // filter: {},
    // sorts: [],
  });
}

/**
 * Create a study page in notion
 * @param {string} name user who starts a study session
 * @param {string} notionUserId id of the user
 * @param {Date} startTime when the session is started
 * @returns
 */
export async function createStudyPage(name, notionUserId, startTime) {
  const korStartTime = getCurrentKoreanTime(startTime);
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
export async function updateEndTime(pageId, endTime) {
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

export async function deleteBlock(blockId) {
  await catchCommonError(notion.blocks.delete, { block_id: blockId });
}

export async function restorePage(pageId) {
  await updatePage({
    page_id: pageId,
    archived: false,
  });
}

async function createPage(obj) {
  return await catchCommonError(notion.pages.create, obj);
}

async function updatePage(obj) {
  await catchCommonError(notion.pages.update, obj);
}

async function catchCommonError(func, obj) {
  try {
    return await func(obj);
  } catch (error) {
    if (error.status === 401) {
      // invalid token key
      console.error(`src/utils/notion.js: ${error.code}: ${error.message}`);
    } else {
      throw error;
    }
  }
}
