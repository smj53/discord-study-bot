import { SlashCommandBuilder, UserSelectMenuInteraction } from "discord.js";

const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

async function execute(interaction: UserSelectMenuInteraction) {
  await interaction.reply("Pong!");
}

export { data, execute };
