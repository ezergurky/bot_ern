import { Events, PermissionFlagsBits } from 'discord.js';

const ADMIN_ROLE_ID = '1192169954112458762';
const PREFIX = 'ern';
const TOXIC_FILE = './data/toxicWords.json';

export const event = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    const member = await message.guild.members.fetch(message.author.id);
    if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
      return message.reply('❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.');
    }

    if ((command === 'kick' || command === 'ban') && args.length > 0) {
      const mention = message.mentions.users.first();
      if (!mention) {
        return message.reply('❌ Tolong tag user yang ingin dikick atau diban.');
      }

      const targetMember = await message.guild.members.fetch(mention.id).catch(() => null);
      if (!targetMember) {
        return message.reply('❌ User tidak ditemukan di server.');
      }

      try {
        if (command === 'kick') {
          await targetMember.kick(`Dikick oleh ${message.author.tag}`);
          return message.reply(`✅ ${mention.tag} berhasil dikick.`);
        } else if (command === 'ban') {
          await targetMember.ban({ reason: `Diban oleh ${message.author.tag}` });
          return message.reply(`✅ ${mention.tag} berhasil diban.`);
        }
      } catch (error) {
        console.error(error);
        return message.reply('❌ Gagal melakukan aksi. Cek permission bot.');
      }
    }

    if(command === 'clear') {
      const count = parseInt(args[0], 10);
      if (isNaN(count) || count < 1 || count > 100) {
        return message.reply('❌ Masukkan jumlah pesan yang valid (1–100).');
      }

      try {
        const deleted = await message.channel.bulkDelete(count, true);
        return message.channel.send(`✅ ${deleted.size} pesan berhasil dihapus.`)
          .then((msg) => setTimeout(() => msg.delete().catch(() => {}), 5000));
      } catch (error) {
        console.error(error);
        return message.reply('❌ Gagal menghapus pesan. Mungkin pesan terlalu lama atau permission tidak cukup.');
      }
    }
  }
};
