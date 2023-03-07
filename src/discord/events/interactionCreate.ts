import { CacheType, Events, Interaction } from "discord.js";
import { DiscordClient } from "../../utils/types.js";

const name = Events.InteractionCreate;

async function listener(interaction: Interaction<CacheType>) {
  if (!interaction.isChatInputCommand()) return;

  const command = (interaction.client as DiscordClient).commands?.get(
    interaction.commandName
  );

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}`);
    console.error(error);
  }
}

export { name, listener };
