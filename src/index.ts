import Discord from "./discord/index.js";
import Notion from "./notion/index.js";
import User from "./user/index.js";

(async () => {
  Notion.init();
  Discord.init();
  User.init();
})();
