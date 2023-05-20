import { Client } from "@notionhq/client";
import {
  studytimeDatabaseId,
  NOTION_TOKEN,
  getCurrentKoreanTime,
  getKorISOString,
} from "../utils";
import {
  CreatePageParameters,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";
import {
  NotionAPIRequestType,
  NotionAPIResponseType,
  WithAuth,
} from "discord-study-bot";

export default class Notion {
  private static notion: Client;

  public static init() {
    this.notion = new Client({ auth: NOTION_TOKEN });
  }

  public static async readDatabase(databaseId: string) {
    const response = await this.notion.databases.query({
      database_id: databaseId,
      // filter: {},
      // sorts: [],
    });
    return response;
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
    const korStartTime = getCurrentKoreanTime(startTime);
    const response = await this.createPage({
      parent: {
        type: "database_id",
        database_id: studytimeDatabaseId,
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
          people: [{ object: "user", id: notionUserId }],
        },
        "휴식 시간 (분)": {
          number: 0,
        },
      },
    });

    return response;
  }

  /**
   * Update the study notion page
   * @param {string} pageId page id of the notion page
   * @param {Date} endTime time when the study session is ended
   * @param {number} totalRest total rest time in milisecond
   */
  public static async updateEnd(
    pageId: string,
    endTime: Date,
    totalRest: number
  ) {
    await this.updatePage({
      page_id: pageId,
      properties: {
        "종료 시간": {
          date: {
            start: getKorISOString(endTime),
            end: null,
          },
        },
        "휴식 시간 (분)": {
          number: Math.floor(totalRest / 60000),
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

  private static async createPage(obj: WithAuth<CreatePageParameters>) {
    return await this.catchCommonError(this.notion.pages.create, obj);
  }

  private static async updatePage(obj: WithAuth<UpdatePageParameters>) {
    await this.catchCommonError(this.notion.pages.update, obj);
  }

  private static async catchCommonError<
    P extends NotionAPIRequestType,
    R extends NotionAPIResponseType
  >(func: (args: WithAuth<P>) => Promise<R>, obj: WithAuth<P>) {
    try {
      return await func(obj);
    } catch (error: any) {
      if (error.status === 401) {
        // invalid token key
        console.error(`src/notion/index.js: ${error.code}: ${error.message}`);
      }
      throw error;
    }
  }
}
