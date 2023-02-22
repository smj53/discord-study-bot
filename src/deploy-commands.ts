import { REST, Routes } from "discord.js";
import {
  CLIENT_ID,
  commandsPath,
  DISCORD_TOKEN,
  getFiles,
  GUILD_ID,
} from "./utils/index.js";

const commands = [];
const commandFiles = getFiles(commandsPath);

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

// and deploy your commands!
(async () => {
  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data: any = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
