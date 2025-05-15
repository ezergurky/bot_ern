const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Membuat pesan verifikasi dengan reaksi.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const verifyEmbed = new EmbedBuilder()
      .setTitle('🔐 Ern Store // Verification')
      .setDescription(
        `Halo! Untuk mengakses semua channel di server ini, kamu perlu diverifikasi terlebih dahulu.\n\n` +
        `✅ **Klik react di bawah ini untuk mendapatkan role Member.**\n\n` +
        `⚠️ Jika kamu unreact, role akan dicabut kembali secara otomatis.`
      )
      .setColor(0x2F3136)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({ text: 'Verification System  • Ern Store', iconURL: interaction.client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [verifyEmbed] });
    const message = await interaction.fetchReply();

    await message.react('✅');

    const verifyMessageId = message.id;
    const guild = interaction.guild;
    const client = interaction.client;
    const member_role = process.env.MEMBER_ROLE;

    const addListener = async (reaction, user) => {
      if (reaction.partial) await reaction.fetch();
      if (user.bot) return;
      if (reaction.message.id !== verifyMessageId) return;
      if (reaction.emoji.name !== '✅') return;

      const member = await guild.members.fetch(user.id);
      const role = guild.roles.cache.get(member_role);
      if (role && !member.roles.cache.has(role.id)) {
        await member.roles.add(role);
      }
    };

    const removeListener = async (reaction, user) => {
      if (reaction.partial) await reaction.fetch();
      if (user.bot) return;
      if (reaction.message.id !== verifyMessageId) return;
      if (reaction.emoji.name !== '✅') return;

      const member = await guild.members.fetch(user.id);
      const role = guild.roles.cache.get(member_role);
      if (role && member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
      }
    };

    client.on('messageReactionAdd', addListener);
    client.on('messageReactionRemove', removeListener);
  },
};
