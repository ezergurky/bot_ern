import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaccess')
    .setDescription('Memberikan akses ke channel yang dipilih.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Pilih user yang akan diberikan akses')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Pilih channel yang akan diberikan akses')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ),

  async execute(interaction) {
    const allowedRoleId = '1190520010158911558';
    const memberRoles = interaction.member.roles;

    if (!memberRoles.cache.has(allowedRoleId)) {
      return await interaction.reply({
        content: '❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.',
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(targetUser.id);
    const channel = interaction.options.getChannel('channel');

    try {
      await channel.permissionOverwrites.edit(member, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      await interaction.reply({
        content: `✅ Akses telah diberikan ke ${targetUser} untuk channel ${channel}.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('❌ Error giving access:', error);
      await interaction.reply({
        content: '❌ Terjadi kesalahan saat memberikan akses.',
        ephemeral: true
      });
    }
  }
};
