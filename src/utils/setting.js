import * as url from "url";
import * as path from "path";
import * as fs from "fs";

const DEFAULT = "default";

const __dirname = url.fileURLToPath(new URL("../..", import.meta.url));
const userSettingPath = path.join(__dirname, ".user-setting");
let userSettingMap;

// TODO: not real enum (the value can be changed)
export const SettingProperty = {
  NAME: "name",
  NOTION_ID: "notionId",
  DURATION: "duration",
};

export function init() {
  const file = fs.readFileSync(userSettingPath);
  if (file) {
    userSettingMap = JSON.parse(file.toString());
  }
  console.log("[WARNING] No .user-setting");
}

export function getName(id) {
  return getProperty(id, SettingProperty.NAME);
}

export function getNotionId(id) {
  return getProperty(id, SettingProperty.NOTION_ID);
}

export function getDuration(id) {
  return getProperty(id, SettingProperty.DURATION);
}

function getProperty(id, property) {
  if (!userSettingMap) {
    return undefined;
  }
  const userSetting = userSettingMap[id];
  if (!userSetting) {
    return undefined;
  }
  let value = userSetting[property];
  if (value === null) {
    value = userSettingMap[DEFAULT][property];
  }
  return value;
}
