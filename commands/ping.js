import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Membalas dengan Pong!'),

  async execute(interaction) {
    await interaction.reply('Pong!');
  }
};
