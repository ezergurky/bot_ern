import { Events } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';

const PREFIX = 'ern';
const ADMIN_ROLE_ID = '1192169954112458762';
const TOXIC_FILE = './data/toxicWords.json';

export const event = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    try {
      const data = await fs.readFile(TOXIC_FILE, 'utf8');
      const toxicWords = JSON.parse(data);
      const content = message.content.toLowerCase();

      if (toxicWords.some(word => content.includes(word))) {
        await message.delete().catch(() => {});
        return message.channel.send(`⚠️ <@${message.author.id}>, jangan berkata kasar.`)
          .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
      }
    } catch (err) {
      console.error('Gagal membaca daftar toxic:', err);
    }

    if (!message.content.startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift()?.toLowerCase();

    const command = commands.get(cmdName);
    if (!command) return;

    if (command.adminOnly) {
      const member = await message.guild.members.fetch(message.author.id);
      if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
        return message.reply('❌ Kamu tidak punya izin untuk pakai perintah ini.');
      }
    }

    command.execute(message, args);
  }
};

export default event;