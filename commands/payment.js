import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs/promises';

const DB_FILE = './data/payments.json';
const ALLOWED_ROLE_ID = '1192169954112458762';

export default {
  data: new SlashCommandBuilder()
    .setName('payment')
    .setDescription('Lihat metode pembayaran kamu'),

  async execute(interaction) {
    const member = interaction.member;

    if (!member.roles.cache.has(ALLOWED_ROLE_ID)) {
      return await interaction.reply({
        content: '❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.',
        ephemeral: true,
      });
    }

    let db = {};
    try {
      const data = await fs.readFile(DB_FILE, 'utf8');
      db = JSON.parse(data);
    } catch {
      return await interaction.reply('❌ Gagal membaca database.');
    }

    const userId = interaction.user.id;
    const payment = db[userId];

    if (!payment) {
      return await interaction.reply('❌ Data payment kamu belum tersedia. Gunakan /addpayment dulu.');
    }

    const embed = new EmbedBuilder()
      .setTitle(`💳 Payment ${interaction.user.username}`)
      .setColor('#00b0f4')
      .addFields(
        { name: 'DANA', value: payment.dana || '-', inline: true },
        { name: 'GoPay', value: payment.gopay || '-', inline: true },
        { name: 'OVO', value: payment.ovo || '-', inline: true },
        { name: 'BRI', value: payment.bri || '-', inline: true },
        { name: 'BCA', value: payment.bca || '-', inline: true },
      )
      .setTimestamp();

    if (payment.qris) embed.setImage(payment.qris);

    await interaction.reply({ embeds: [embed] });
  }
};