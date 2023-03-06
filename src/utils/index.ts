import * as url from "url";
import * as path from "path";
import * as fs from "fs";

const botChannelId = "1072156767980625950";
const loungeChannelId = "1068129906686439438";
const databaseId = "d1b28a88d286408a923301b3d82a30de";
const usersDatabaseId = "26c53290f0ad49028d93f6475d63291a";

const rootPath = url.fileURLToPath(new URL("../..", import.meta.url));
const commandsPath = path.join(rootPath, "out", "discord", "commands");
const eventsPath = path.join(rootPath, "out", "discord", "events");
const userSettingPath = path.join(rootPath, ".user-setting");

export { botChannelId, loungeChannelId, databaseId, usersDatabaseId };
export { commandsPath, eventsPath, userSettingPath };
export { DISCORD_TOKEN, CLIENT_ID, GUILD_ID, NOTION_TOKEN } from "./dotenv.js";

export function getFiles(path: string) {
  const files = fs.readdirSync(path).filter((file) => file.endsWith(".js"));
  return files;
}
