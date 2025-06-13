import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('feedback')
    .setDescription('Kirim feedback untuk Ern Store')
    .addUserOption(option =>
      option.setName('seller')
        .setDescription('Nama seller')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('buyer')
        .setDescription('Nama buyer')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('produk')
        .setDescription('Nama produk atau jasa')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('note')
        .setDescription('Catatan / feedback')
        .setRequired(true)
    ),

  async execute(interaction) {
    const allowedChannelId = '1190545557127700540';

    if (interaction.channelId !== allowedChannelId) {
      return interaction.reply({ content: `❌ Command ini hanya bisa digunakan di channel <#${allowedChannelId}>.`, ephemeral: true });
    }

    const seller = interaction.options.getUser('seller');
    const buyer = interaction.options.getUser('buyer');
    const produk = interaction.options.getString('produk');
    const note = interaction.options.getString('note');

    const embed = new EmbedBuilder()
      .setTitle('📣 FEEDBACK ERN STORE')
      .setColor('#0099ff')
      .addFields(
        { name: '👤 Nama Seller', value: `${seller}`, inline: false },
        { name: '🧑 Nama Buyer', value: `${buyer}`, inline: false },
        { name: '📦 Produk/Jasa', value: produk, inline: false },
        { name: '📝 Note', value: note, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ content: '✅ Feedback terkirim!', ephemeral: true });
    await interaction.channel.send({ embeds: [embed] });
  }
};
