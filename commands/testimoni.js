import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('testimoni')
    .setDescription('Buat testimoni pembelian')
    .addUserOption(option =>
      option.setName('pembeli')
        .setDescription('Tag pembeli')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('produk')
        .setDescription('Nama produk yang dibeli')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('harga')
        .setDescription('Harga produk yang dibeli (contoh: Rp100.000)')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('bukti')
        .setDescription('Upload bukti screenshot pembelian')
        .setRequired(true)
    ),

  async execute(interaction) {
    const allowedChannelId = '1190542328105029682';

    if (interaction.channelId !== allowedChannelId) {
      return interaction.reply({
        content: `❌ Command ini hanya bisa digunakan di channel <#${allowedChannelId}>.`,
        ephemeral: true
      });
    }

    const penjual = interaction.user;
    const pembeli = interaction.options.getUser('pembeli');
    const produk = interaction.options.getString('produk');
    const harga = interaction.options.getString('harga');
    const bukti = interaction.options.getAttachment('bukti');

    const embed = new EmbedBuilder()
      .setTitle('🧾 TESTIMONI PEMBELIAN')
      .setColor('#00b0f4')
      .addFields(
        { name: '👤 Nama Penjual', value: `${penjual}`, inline: true },
        { name: '🙋 Nama Pembeli', value: `${pembeli}`, inline: true },
        { name: '📦 Barang Dibeli', value: `${produk}`, inline: false },
        { name: '💰 Harga', value: `\`${harga}\``, inline: true }
      )
      .setImage(bukti.url)
      .setFooter({ text: '🛒 Makasih sudah berbelanja di sini!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
