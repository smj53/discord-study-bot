import dotenv from "dotenv";

dotenv.config();

function typeGuard(env: string | undefined) {
  if (typeof env === "string") {
    return env;
  }
  throw new Error("env not found error");
}

export const DISCORD_TOKEN = typeGuard(process.env.DISCORD_TOKEN);
export const CLIENT_ID = typeGuard(process.env.CLIENT_ID);
export const GUILD_ID = typeGuard(process.env.GUILD_ID);
export const NOTION_TOKEN = typeGuard(process.env.NOTION_TOKEN);
