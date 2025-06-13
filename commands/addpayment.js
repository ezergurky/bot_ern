import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs/promises';

const DB_FILE = './data/payments.json';
const ALLOWED_ROLE_ID = '1190520010158911558';

export default {
  data: new SlashCommandBuilder()
    .setName('addpayment')
    .setDescription('Tambahkan metode pembayaran user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User atau seller')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('dana').setDescription('Nomor DANA'))
    .addStringOption(option =>
      option.setName('gopay').setDescription('Nomor GoPay'))
    .addStringOption(option =>
      option.setName('ovo').setDescription('Nomor OVO'))
    .addStringOption(option =>
      option.setName('bri').setDescription('Rekening BRI'))
    .addStringOption(option =>
      option.setName('bca').setDescription('Rekening BCA'))
    .addAttachmentOption(option =>
      option.setName('qris')
        .setDescription('Upload QRIS dalam bentuk gambar')),

  async execute(interaction) {
    const member = interaction.member;

    if (!member.roles.cache.has(ALLOWED_ROLE_ID)) {
      return await interaction.reply({
        content: '❌ Kamu tidak memiliki izin untuk menggunakan command ini.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('user');
    const dana = interaction.options.getString('dana') || '-';
    const gopay = interaction.options.getString('gopay') || '-';
    const ovo = interaction.options.getString('ovo') || '-';
    const bri = interaction.options.getString('bri') || '-';
    const bca = interaction.options.getString('bca') || '-';
    const qris = interaction.options.getAttachment('qris')?.url || null;

    let db = {};
    try {
      const data = await fs.readFile(DB_FILE, 'utf8');
      db = JSON.parse(data);
    } catch {
      db = {};
    }

    db[user.id] = { dana, gopay, ovo, bri, bca, qris };
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));

    await interaction.reply(`✅ Data payment untuk ${user} berhasil disimpan.`);
  }
};
