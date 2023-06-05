import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import User from "../../user/index.js";

const data = new SlashCommandBuilder()
  .setName("휴식")
  .setDescription("휴식 toggle");

async function execute(interaction: ChatInputCommandInteraction) {
  let msg = "";
  const user = User.findUserByDiscordId(interaction.user.id);
  const res = user.rest();
  if (res === undefined) {
    msg = "모각코 중이 아닙니다.";
  } else if (res) {
    msg = "휴식을 시작합니다.";
  } else {
    msg = "휴식을 종료합니다.";
  }
  await interaction.reply({ content: msg, ephemeral: true });
}

export { data, execute };
