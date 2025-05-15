const { REST, Routes } = require('discord.js');
const { readdirSync } = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
        if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
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
        { body: commands },
    );

    console.log('✅ Slash commands berhasil di-deploy!');
    } catch (error) {
    console.error('❌ Gagal deploy slash command:', error);
    }
})();
