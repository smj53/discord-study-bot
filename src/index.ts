import Discord from "./discord/index.js";
import Notion from "./notion/index.js";
import User from "./user/index.js";

Discord.init();
Notion.init();

Discord.run();
User.init();
