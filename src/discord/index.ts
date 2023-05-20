import {
  Client,
  ClientOptions,
  Collection,
  Events,
  GatewayIntentBits,
  TextChannel,
  User,
} from "discord.js";
import {
  commandsPath,
  eventsPath,
  getFiles,
  DISCORD_TOKEN,
  botChannelId,
} from "../utils";
import { Command, Event } from "discord-study-bot";

export class DiscordClient extends Client {
  public commands: Collection<string, Command>;

  constructor(options: ClientOptions, commands: Collection<string, Command>) {
    super(options);
    this.commands = commands;
  }
}

export default class Discord {
  private static client: DiscordClient;
  public static botChannel: TextChannel;

  public static async init(): Promise<void> {
    const commands = await this.fetchCommands();
    this.client = new DiscordClient(
      {
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
      },
      commands
    );
    await this.registerEvents();
    await this.client.login(DISCORD_TOKEN);
    await this.setBotChannel();
  }

  public static async registerEvents(): Promise<void> {
    const eventFiles = getFiles(eventsPath);
    for (const file of eventFiles) {
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
    }
  }

  private static async fetchCommands(): Promise<Collection<string, Command>> {
    const commands: Collection<string, Command> = new Collection();
    const commandFiles = getFiles(commandsPath);
    for (const file of commandFiles) {
      const filePath = `./commands/${file}`;
      const command: Command = await import(filePath);

      if (!("data" in command) || !("execute" in command)) {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
        continue;
      }

      commands.set(command.data.name, command);
    }
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
