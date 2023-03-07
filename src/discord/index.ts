import {
  Collection,
  Events,
  GatewayIntentBits,
  TextChannel,
  User,
} from "discord.js";
import { Command, DiscordClient, Event } from "../utils/types.js";
import {
  commandsPath,
  eventsPath,
  getFiles,
  DISCORD_TOKEN,
  botChannelId,
} from "../utils/index.js";

export default class Discord {
  private static client: DiscordClient;
  public static botChannel: TextChannel;

  public static init(): void {
    const commands = this.fetchCommands();
    const client = new DiscordClient(
      {
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
      },
      commands
    );
    this.client = client;
  }

  public static run(): void {
    (async () => {
      this.registerEvents();
      await this.client.login(DISCORD_TOKEN);
      await this.setBotChannel();
    })();
  }

  public static registerEvents(): void {
    const eventFiles = getFiles(eventsPath);
    eventFiles.forEach(async (file) => {
      const filePath = `./events/${file}`;
      const event: Event = await import(filePath);

      if (!("name" in event) || !("listener" in event)) {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "name" or "listener" property.`
        );
        return;
      }

      event.name === Events.ClientReady
        ? this.client.once(event.name, event.listener)
        : this.client.on(event.name, event.listener);
    });
  }

  private static fetchCommands(): Collection<string, Command> {
    const commands: Collection<string, Command> = new Collection();
    const commandFiles = getFiles(commandsPath);
    commandFiles.forEach(async (file) => {
      const filePath = `./commands/${file}`;
      const command: Command = await import(filePath);

      if (!("data" in command) || !("execute" in command)) {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
        return;
      }

      commands.set(command.data.name, command);
    });
    return commands;
  }

  public static async fetchUser(userId: string): Promise<User> {
    return this.client.users.fetch(userId);
  }

  public static async setBotChannel(): Promise<void> {
    try {
      const botChannel = (await this.client.channels.fetch(
        botChannelId
      )) as TextChannel;
      this.botChannel = botChannel;
    } catch (error) {
      throw Error("Error while setting Bot Channel");
    }
  }
}
