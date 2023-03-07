interface UserData {
  discord: {
    // DiscordData들
  };
  notion: {
    // NotionData들
  };
}

export default class User {
  private static users: UserData[];

  public static init() {
    const users: UserData[] = [];
    (async () => {
      // TODO
      // 1. 전체 list 불러오기
      // for문 돌면서 discord에 각자 유저정보 받아오기
      // Map 생성
    })();
    this.users = users;
  }

  getNotionId(discordId: string) {
    // TODO
  }

  getDiscordId(notionId: string) {
    // TODO
  }
}
