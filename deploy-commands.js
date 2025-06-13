import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Simulasi __dirname di ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);

  if ('data' in command.default && 'execute' in command.default) {
    commands.push(command.default.data.toJSON());
  } else {
    console.warn(`[WARNING] Command di ${file} tidak punya 'data' atau 'execute'.`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Sedang mendaftarkan (refresh) slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log('✅ Slash commands berhasil di-deploy!');
  } catch (error) {
    console.error('❌ Gagal deploy slash command:', error);
  }
})();
