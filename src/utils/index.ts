import path from "path";
import fs from "fs";
import url from "url";

// Dotenv
export * from "./dotenv";

// Discord Channel
export const botChannelId = "1072156767980625950";
export const loungeChannelId = "1068129906686439438";

// Notion Database
export const studytimeDatabaseId = "25684024fb2b498f962b6ee7abed223f";
export const usersDatabaseId = "26c53290f0ad49028d93f6475d63291a";

// Path
const rootPath = url.fileURLToPath(new URL("../..", import.meta.url));
export const commandsPath = path.join(rootPath, "out", "discord", "commands");
export const eventsPath = path.join(rootPath, "out", "discord", "events");

// functions
export function getFiles(path: string) {
  const files = fs.readdirSync(path).filter((file) => file.endsWith(".js"));
  return files;
}

const KR_TIME_DIFF = 9;

export function getKorISOString(date: Date): string {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + KR_TIME_DIFF);
  return `${newDate.toISOString().substring(0, 19)}+09:00`;
}
