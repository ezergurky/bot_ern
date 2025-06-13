import { SlashCommandBuilder, ChannelType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removeaccess')
    .setDescription('Menghapus akses user ke channel tertentu.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Pilih user yang akan dicabut aksesnya')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Pilih channel yang akan dicabut aksesnya')
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
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false
      });

      await interaction.reply({
        content: `✅ Akses ${targetUser} telah dicabut dari channel ${channel}.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('❌ Error removing access:', error);
      await interaction.reply({
        content: '❌ Terjadi kesalahan saat mencabut akses.',
        ephemeral: true
      });
    }
  }
};
