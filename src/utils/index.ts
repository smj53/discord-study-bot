import * as url from "url";
import * as path from "path";
import * as fs from "fs";

const botChannelId = "1072156767980625950";
const loungeChannelId = "1068129906686439438";
const studytimeDatabaseId = "25684024fb2b498f962b6ee7abed223f";
const usersDatabaseId = "26c53290f0ad49028d93f6475d63291a";

const rootPath = url.fileURLToPath(new URL("../..", import.meta.url));
const commandsPath = path.join(rootPath, "out", "discord", "commands");
const eventsPath = path.join(rootPath, "out", "discord", "events");

export { botChannelId, loungeChannelId, studytimeDatabaseId, usersDatabaseId };
export { commandsPath, eventsPath };
export {
  NODE_ENV,
  DISCORD_TOKEN,
  CLIENT_ID,
  GUILD_ID,
  NOTION_TOKEN,
} from "./dotenv.js";

export function getFiles(path: string) {
  const files = fs.readdirSync(path).filter((file) => file.endsWith(".js"));
  return files;
}
