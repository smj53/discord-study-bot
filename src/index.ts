import Discord from "./discord";
import Notion from "./notion";
import User from "./user";

async function run() {
  Notion.init();
  await Discord.init();
  await User.init();
}
run();
