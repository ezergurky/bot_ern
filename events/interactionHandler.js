import Discord from 'discord.js';
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonStyle,
  ActionRowBuilder,
  PermissionsBitField,
  EmbedBuilder,
  InteractionType,
  ButtonBuilder,
} = Discord;

let ticketCount = 1;

function sendTicketLog(client, type, data) {
  const logChannel = client.channels.cache.get(process.env.TICKET_LOG);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setTitle(type === 'open' ? '📩 Ticket Opened' : '📪 Ticket Closed')
    .addFields(
      { name: 'Ticket Name', value: data.name, inline: true },
      { name: type === 'open' ? 'Created By' : 'Ticket Author', value: `<@${data.createdBy}>`, inline: true }
    )
    .setTimestamp()
    .setColor(type === 'open' ? 0x00ff99 : 0xff0000);

  if (type === 'open') {
    embed.addFields(
      { name: 'Opened Date', value: data.openDate, inline: true },
      { name: 'Ticket Type', value: data.ticketType, inline: true }
    );
  } else {
    embed.addFields(
      { name: 'Closed By', value: `<@${data.closedBy}>`, inline: true },
      { name: 'Claimed By', value: `<@${data.claimedBy ?? data.createdBy}>`, inline: true },
      { name: 'Open Date', value: data.openDate, inline: true },
      { name: 'Close Date', value: data.closeDate, inline: true }
    );
  }

  logChannel.send({ embeds: [embed] }).catch(console.error);
}

export default async (client) => {
  client.ticketThreadInfo ??= {};

  client.on('interactionCreate', async (interaction) => {
    // Button interactions
    if (interaction.isButton()) {
      const ticketTypes = {
        ticket_samp: 'Product SAMP',
        ticket_digital: 'Digital Product',
        ticket_discord: 'Discord Product',
      };

      // Jika tombol untuk membuka modal tiket diklik
      if (ticketTypes[interaction.customId]) {
        const modal = new ModalBuilder()
          .setCustomId(`modal_${interaction.customId}`)
          .setTitle('Formulir Tiket Order')
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('buyer_name')
                .setLabel('Nama Buyer')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('seller_name')
                .setLabel('Nama Seller')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId('order_product')
                .setLabel('Order Product')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );

        client.ticketTypeSelected = ticketTypes[interaction.customId];
        return interaction.showModal(modal);
      }

      // Klaim tiket
      if (interaction.customId === 'claim_ticket') {
        if (client.ticketThreadInfo?.[interaction.channelId]) {
          client.ticketThreadInfo[interaction.channelId].claimedBy = interaction.user.id;
        }
        await interaction.reply({ content: `🎟️ Tiket ini sekarang ditangani oleh ${interaction.user}.`, ephemeral: false });
        return;
      }

      // Tombol tutup tiket, minta konfirmasi
      if (interaction.customId === 'close_ticket') {
        const confirmRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_close')
            .setLabel('✅ Confirm Close')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancel_close')
            .setLabel('❌ Cancel')
            .setStyle(ButtonStyle.Secondary)
        );
        await interaction.reply({
          content: '⚠️ Apakah kamu yakin ingin menutup tiket ini?',
          components: [confirmRow],
          ephemeral: true,
        });
        return;
      }

      // Konfirmasi tutup tiket
      if (interaction.customId === 'confirm_close') {
        await interaction.reply({ content: 'Tiket akan ditutup dalam 5 detik...', ephemeral: true });

        setTimeout(() => {
          const closeDate = new Date().toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const threadInfo = client.ticketThreadInfo?.[interaction.channelId] || {};

          sendTicketLog(client, 'close', {
            name: interaction.channel.name,
            createdBy: threadInfo.createdBy || interaction.user.id,
            claimedBy: threadInfo.claimedBy,
            closedBy: interaction.user.id,
            openDate: threadInfo.openDate || 'Unknown',
            closeDate,
          });

          interaction.channel.delete().catch(console.error);
          delete client.ticketThreadInfo[interaction.channelId];
        }, 5000);

        return;
      }

      // Batal tutup tiket
      if (interaction.customId === 'cancel_close') {
        await interaction.reply({ content: '❌ Penutupan tiket dibatalkan.', ephemeral: true });
        return;
      }
    }

    // Modal submit
    if (interaction.type === InteractionType.ModalSubmit) {
      const buyer = interaction.fields.getTextInputValue('buyer_name');
      const seller = interaction.fields.getTextInputValue('seller_name');
      const product = interaction.fields.getTextInputValue('order_product');

      const guild = interaction.guild;
      const user = interaction.user;
      const channelName = `tiket-${ticketCount++}`;

      // Buat channel tiket baru dengan permission yang sesuai
      const channel = await guild.channels.create({
        name: channelName,
        type: 0, // GUILD_TEXT
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      // Embed tiket
      const ticketEmbed = new EmbedBuilder()
        .setTitle('🎫 Ticket Opened')
        .setDescription(`${user} telah membuat tiket baru.`)
        .addFields(
          { name: 'Nama Buyer', value: buyer, inline: true },
          { name: 'Nama Seller', value: seller, inline: true },
          { name: 'Order Product', value: product, inline: false },
          { name: 'Kategori Tiket', value: client.ticketTypeSelected, inline: true }
        )
        .setFooter({ text: 'Ern Ticket | /close' })
        .setColor(0x00aaff)
        .setTimestamp();

      // Tombol claim dan close
      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('claim_ticket')
          .setLabel('✅ Claim Ticket')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('❌ Close Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      // Tombol buka tiket (link)
      const goToTicketButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('📨 Buka Tiket')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/channels/${guild.id}/${channel.id}`)
      );

      // Balas interaksi dengan tautan tiket
      await interaction.reply({
        content: '✅ Tiket kamu berhasil dibuat!',
        components: [goToTicketButton],
        ephemeral: true,
      });

      // Kirim pesan tiket di channel baru
      await channel.send({ content: `<@${user.id}>`, embeds: [ticketEmbed], components: [buttonRow] });

      // Catat waktu buka tiket
      const openDate = new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      sendTicketLog(client, 'open', {
        name: channelName,
        createdBy: user.id,
        openDate,
        ticketType: client.ticketTypeSelected,
      });

      // Simpan info tiket untuk tracking
      client.ticketThreadInfo[channel.id] = {
        createdBy: user.id,
        openDate,
        ticketType: client.ticketTypeSelected,
      };
    }
  });
};
