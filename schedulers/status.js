import cron from 'node-cron';
import pkg from 'discord.js';
const { EmbedBuilder } = pkg;

export default (client) => {
  const CHANNEL_ID = process.env.STATUS_ID;

  if (!CHANNEL_ID) {
    console.warn('⚠️ Environment variable STATUS_ID belum di-set!');
    return;
  }

  const sendEmbedMessage = async (embed, mentionEveryone = false) => {
    try {
      const channel = await client.channels.fetch(CHANNEL_ID);
      if (!channel) {
        console.warn('⚠️ Channel dengan ID STATUS_ID tidak ditemukan!');
        return;
      }
      await channel.send({
        content: mentionEveryone ? '@everyone' : undefined,
        embeds: [embed],
        allowedMentions: mentionEveryone ? { parse: ['everyone'] } : {}
      });
    } catch (error) {
      console.error('Gagal mengirim pesan ke channel:', error);
    }
  };

  cron.schedule('0 9 * * *', async () => {
    const embed = new EmbedBuilder()
      .setTitle('🛍️ Ern Store // Open')
      .setDescription('Selamat datang di Ern Store!\nKami telah resmi buka hari ini. Temukan berbagai produk menarik berikut ini:')
      .addFields(
        {
          name: '🌐 Product RDP & Hosting',
          value: [
            '<#1190549005982240808>',
            '<#1190549057932906596>',
            '<#1190549160408129657>',
            '<#1190549215009579028>',
            '<#1276762850198814761>',
          ].join('\n')
        },
        {
          name: '🗺️ Product Mapping',
          value: [
            '<#1191059180421914634>',
            '<#1191059261577515121>',
            '<#1191061466112086076>',
            '<#1372482425870876703>',
          ].join('\n')
        },
        {
          name: '🚔 Product SAMP',
          value: [
            '<#1190546402191876197>',
            '<#1190546732430393385>',
            '<#1190547280097464330>',
            '<#1196803943121039461>',
            '<#1190547421416144967>',
            '<#1190547517054668900>',
          ].join('\n')
        },
        {
          name: '💬 Discord Product',
          value: [
            '<#1190549558195916871>',
            '<#1190549723178860606>',
            '<#1190549774592659516>',
            '<#1194796584014188675>',
            '<#1372469595247611985>',
            '<#1372471222087975032>',
          ].join('\n')
        },
        {
          name: '📱 Aplikasi Premium',
          value: [
            '<#1198814212768665754>',
            '<#1372467910530043924>',
            '<#1372467969719795802>',
            '<#1372467989353594920>',
            '<#1372468008488009748>',
            '<#1372468029870309376>',
            '<#1372468051076714527>',
            '<#1372468071196790834>',
            '<#1372469229563150417>',
          ].join('\n')
        }
      )
      .setFooter({ text: '🕘 Store buka jam 09.00 - 22.00 WIB setiap hari' })
      .setColor(0x00ff99)
      .setTimestamp();

    await sendEmbedMessage(embed, true);
  }, {
    timezone: 'Asia/Jakarta'
  });

  cron.schedule('0 22 * * *', async () => {
    const embed = new EmbedBuilder()
      .setTitle('🚪 Ern Store // Closed')
      .setDescription('Terima kasih telah berkunjung!\nStore telah ditutup untuk hari ini. Sampai jumpa besok 👋')
      .setColor(0xff0000)
      .setTimestamp();

    await sendEmbedMessage(embed, true);
  }, {
    timezone: 'Asia/Jakarta'
  });
};
