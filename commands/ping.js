const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Membalas dengan Pong!'),

  async execute(interaction) {
    await interaction.reply('Pong!');
  }
};
