import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('credit')
    .setDescription('Generate credit otomatis untuk penjualan.')
    .addUserOption(option =>
      option.setName('seller')
        .setDescription('Pilih Seller')
        .setRequired(true)
    ),

  async execute(interaction) {
    const seller = interaction.options.getUser('seller');
    const sellerMention = `<@${seller.id}>`;
    const orderChannelMention = `<#1190538852788609054>`;
    const channelName = interaction.channel.name;

    const productName = channelName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      || 'Unknown Product';

    const embed = new EmbedBuilder()
      .setTitle('🧾 Credit Product')
      .setColor('#00b894')
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/833/833314.png') // Ganti jika perlu
      .addFields(
        { name: '🧑‍💼 Seller', value: sellerMention, inline: true },
        { name: '📦 Product', value: `\`${productName}\``, inline: true },
        { name: '📝 Order', value: `${orderChannelMention}`, inline: true },
      )
      .setFooter({ text: 'Ern Store System' })
      .setTimestamp();

    await interaction.deferReply({ ephemeral: true });
    await interaction.deleteReply();
    await interaction.channel.send({ embeds: [embed] });
  }
};
