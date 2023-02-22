import { Client, Events } from "discord.js";

const name = Events.ClientReady;

function listener(client: Client<true>) {
  console.log(`Ready! Logged in as ${client.user.tag}`);
}

export { name, listener };
