import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Discord from "../index.js";

const data = new SlashCommandBuilder()
  .setName("toggle")
  .setDescription("알림 기능 토글");

async function execute(interaction: ChatInputCommandInteraction) {
  Discord.alarmFlag = !Discord.alarmFlag;
  await interaction.reply({
    content: `알림 기능 ${Discord.alarmFlag ? "on" : "off"}`,
    ephemeral: true,
  });
}

export { data, execute };
