import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('createticket')
    .setDescription('Buat panel tiket order'),

  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_samp')
        .setLabel('🎮 Product SAMP')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId('ticket_digital')
        .setLabel('🌐 Digital Product')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('ticket_discord')
        .setLabel('📦 Discord Product')
        .setStyle(ButtonStyle.Primary)
    );

    const embed = new EmbedBuilder()
      .setTitle('Ern Store // Ticket')
      .setDescription('Klik salah satu tombol di bawah ini untuk membuat tiket order sesuai kategori.')
      .setColor(0x00aaff)
      .setImage('https://cdn.discordapp.com/attachments/1140474411091230740/1377878252550488145/ChatGPT_Image_May_30_2025_12_05_59_PM.png');

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
