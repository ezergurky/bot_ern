import pkg from 'discord.js';
const { Client, Collection, GatewayIntentBits, ActivityType } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import storeStatus from './schedulers/status.js';
import levelSystem from './systems/level.js';
import interactionHandler from './events/interactionHandler.js';
import { event as antiToxicEvent } from './events/antiToxic.js';
import { event as antiLinkEvent } from './events/antiLink.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

storeStatus(client);
interactionHandler(client);
client.on(antiToxicEvent.name, (...args) => antiToxicEvent.execute(...args));
client.on(antiLinkEvent.name, (...args) => antiLinkEvent.execute(...args));

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const commandModule = await import(`file://${filePath}`);
  const command = commandModule.default;

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] Command di ${file} tidak punya 'data' atau 'execute'.`);
  }
}

const eventsPath = path.join(__dirname, 'events/message');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const { event } = await import(`file://${filePath}`);

  if (event?.name && typeof event.execute === 'function') {
    client.on(event.name, (...args) => event.execute(...args));
  } else {
    console.warn(`[WARNING] Event di ${file} tidak valid.`);
  }
}

client.on('messageCreate', async (message) => {
  await levelSystem(client, message);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Error saat menjalankan perintah.', ephemeral: true });
    } else {
      await interaction.reply({ content: '❌ Error saat menjalankan perintah.', ephemeral: true });
    }
  }
});

client.once('ready', () => {
  console.log(`🤖 Bot ${client.user.tag} sudah online!`);
  client.user.setActivity('Ern Store // 100% Trusted', { type: ActivityType.Watching });
});

client.login(process.env.TOKEN);
