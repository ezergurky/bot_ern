import {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('creategiveaway')
    .setDescription('Buat giveaway dengan tombol join dan durasi otomatis')
    .addStringOption(option =>
      option.setName('judul')
        .setDescription('Judul giveaway')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('deskripsi')
        .setDescription('Deskripsi giveaway')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel untuk giveaway')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('durasi')
        .setDescription('Durasi (contoh: 10m, 2h, 1d)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('pemenang')
        .setDescription('Jumlah pemenang')
        .setRequired(true)),

  async execute(interaction) {
    const judul = interaction.options.getString('judul');
    const deskripsi = interaction.options.getString('deskripsi');
    const channel = interaction.options.getChannel('channel');
    const durasiInput = interaction.options.getString('durasi');
    const jumlahPemenang = interaction.options.getInteger('pemenang');
    const host = interaction.user;

    const waktuMs = parseDuration(durasiInput);
    if (!waktuMs) return interaction.reply({ content: '❌ Format durasi tidak valid! Gunakan 10m, 2h, atau 1d.', ephemeral: true });

    const waktuBerakhir = new Date(Date.now() + waktuMs);
    const peserta = new Set();

    const embed = new EmbedBuilder()
      .setTitle(`🎉 ${judul}`)
      .setDescription(deskripsi)
      .setColor('#00b0f4')
      .addFields(
        { name: '👤 Host', value: `${host}`, inline: true },
        { name: '⏳ Berakhir pada', value: waktuBerakhir.toLocaleString('id-ID'), inline: true },
        { name: '🏆 Jumlah Pemenang', value: `${jumlahPemenang}`, inline: true },
        { name: '📊 Total Peserta', value: `0`, inline: true }
      )
      .setFooter({ text: 'Klik tombol di bawah untuk ikut serta!' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('join_giveaway')
        .setLabel('Ikut Giveaway 🎉')
        .setStyle(ButtonStyle.Success)
    );

    const giveawayMessage = await channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ Giveaway berhasil dikirim ke ${channel}`, ephemeral: true });

    const collector = giveawayMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: waktuMs
    });

    collector.on('collect', async i => {
      if (peserta.has(i.user.id)) {
        await i.reply({ content: '❌ Kamu sudah ikut giveaway ini!', ephemeral: true });
      } else {
        peserta.add(i.user.id);
        embed.data.fields[3].value = `${peserta.size}`;
        await giveawayMessage.edit({ embeds: [embed], components: [row] });
        await i.reply({ content: '✅ Kamu berhasil ikut giveaway!', ephemeral: true });
      }
    });

    collector.on('end', async () => {
      const endedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('giveaway_ended')
          .setLabel('🎉 Giveaway Berakhir')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );

      embed.setColor('#808080');
      embed.setFooter({ text: 'Giveaway telah berakhir.' });

      await giveawayMessage.edit({ embeds: [embed], components: [endedRow] });

      if (peserta.size === 0) {
        return channel.send(`⚠️ Giveaway **${judul}** berakhir tanpa peserta.`);
      }

      const pesertaArray = Array.from(peserta);
      const pemenangDipilih = shuffle(pesertaArray).slice(0, jumlahPemenang);

      await channel.send({
        content: `🎉 Giveaway **${judul}** telah berakhir!\nSelamat kepada:\n${pemenangDipilih.map(id => `<@${id}>`).join('\n')} 🎊`
      });
    });
  }
};

function parseDuration(input) {
  const match = input.match(/^(\d+)([mhd])$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return null;
  }
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
