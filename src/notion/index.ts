import { Client } from "@notionhq/client";
import { getCurrentKoreanTime, getKorISOString } from "../utils/time.js";
import { databaseId, NOTION_TOKEN } from "../utils/index.js";

export default class Notion {
  private static notion: Client;

  public static init() {
    this.notion = new Client({ auth: NOTION_TOKEN });
  }

  public static async readDatabase() {
    const response = await this.notion.databases.query({
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
  public static async createStudyPage(
    name: string,
    notionUserId: string,
    startTime: Date
  ) {
    const korStartTime = getCurrentKoreanTime();
    const response = await this.createPage({
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
  public static async updateEndTime(pageId: string, endTime: Date) {
    await this.updatePage({
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

  public static async deleteBlock(blockId: string) {
    await this.catchCommonError(this.notion.blocks.delete, {
      block_id: blockId,
    });
  }

  public static async restorePage(pageId: string) {
    await this.updatePage({
      page_id: pageId,
      archived: false,
    });
  }

  private static async createPage(obj: any) {
    return await this.catchCommonError(this.notion.pages.create, obj);
  }

  private static async updatePage(obj: any) {
    await this.catchCommonError(this.notion.pages.update, obj);
  }

  private static async catchCommonError(func: any, obj: any) {
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
}
