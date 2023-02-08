import * as url from "url";
import * as path from "path";
import * as fs from "fs";

const __dirname = url.fileURLToPath(new URL("..", import.meta.url));
const commandsPath = path.join(__dirname, "commands");

export function getCommandFiles() {
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  return commandFiles;
}
