import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { token } from "./utils/dotenv.js";
import { getCommandFiles } from "./utils/index.js";
import { startStudy, endStudy } from "./utils/study.js";
import { init as settingInit } from "./utils/setting.js";

const botChannelId = "1072156767980625950";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// 앱 실행
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Commands 불러오기
client.commands = new Collection();
const commandFiles = getCommandFiles();
commandFiles.forEach(async (file) => {
  const filePath = `./commands/${file}`;
  const command = await import(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
});

// Commands 등록
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

// 설정 불러오기
settingInit();

// Events 등록
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const user = await client.users.fetch(newState.id);
  const channel = await client.channels.fetch(botChannelId);

  if (oldState.channelId && !newState.channelId) {
    const message = `@everyone ${user.username} 님이 나감`;
    channel.send(message);
    await endStudy(user.id);
  } else if (!oldState.channelId && newState.channelId) {
    await startStudy(user.id);
  }
});

// 로그인
client.login(token);
