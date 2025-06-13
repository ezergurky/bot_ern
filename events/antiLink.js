import { Events } from 'discord.js';

const ADMIN_ROLE_ID = '1192169954112458762'; 

export const event = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const member = await message.guild.members.fetch(message.author.id);
    if (member.roles.cache.has(ADMIN_ROLE_ID)) return;

    const linkRegex = /(https?:\/\/[^\s]+)/gi;

    if (linkRegex.test(message.content)) {
      await message.delete().catch(() => {});
      return message.channel.send(`🔗 <@${message.author.id}>, mengirim tautan tidak diizinkan.`)
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }
};
