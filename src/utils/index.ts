import * as url from "url";
import * as path from "path";
import * as fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// 경로
const rootPath = url.fileURLToPath(new URL("../..", import.meta.url));
const commandsPath = path.join(rootPath, "out", "commands");

// 환경 변수 & 상수
export const token = typeGuard(process.env.DISCORD_TOKEN);
export const clientId = typeGuard(process.env.CLIENT_ID);
export const guildId = typeGuard(process.env.GUILD_ID);

export const botChannelId = "1072156767980625950";

// 유틸 함수
// TODO: change function name
function typeGuard(env: string | undefined) {
  if (typeof env === "string") {
    return env;
  }
  throw new Error("no env error");
}

export function getCommandFiles() {
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  return commandFiles;
}
