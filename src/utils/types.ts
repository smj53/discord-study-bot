import {
  Awaitable,
  Client,
  ClientEvents,
  ClientOptions,
  Collection,
  Interaction,
  SlashCommandBuilder,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: Interaction) => Awaitable<void>;
}

export interface Event {
  name: keyof ClientEvents;
  listener: (...args: ClientEvents[keyof ClientEvents]) => Awaitable<void>;
}

export class DiscordClient extends Client {
  public commands: Collection<string, Command>;

  constructor(options: ClientOptions, commands: Collection<string, Command>) {
    super(options);
    this.commands = commands;
  }
}
