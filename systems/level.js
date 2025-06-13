import pkg from 'discord.js';
const { ChannelType } = pkg;
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import dotenv from 'dotenv';

dotenv.config();

const LEVEL_LOG = process.env.LEVEL_LOG;

const adapter = new JSONFile('data/db.json');
const db = new Low(adapter, { users: {} });

export default async (client, message) => {
  if (message.author.bot || !message.guild) return;

  await db.read();
  if (!db.data) db.data = { users: {} };

  const userId = message.author.id;
  const guildId = message.guild.id;
  const key = `${guildId}_${userId}`;
  const xpToAdd = Math.floor(Math.random() * 10) + 5;

  if (!db.data.users[key]) {
    db.data.users[key] = { xp: 0, level: 1 };
  }

  const userData = db.data.users[key];
  userData.xp += xpToAdd;

  const xpNeeded = userData.level * 100;

  if (userData.xp >= xpNeeded) {
    userData.level++;
    userData.xp = 0;

    const levelUpMessage = `🥳 Hey <@${userId}>! Kamu naik dari **Level ${userData.level - 1}** ke **Level ${userData.level}**. Tetap semangat!`;

    if (LEVEL_LOG) {
      try {
        const levelChannel = await client.channels.fetch(LEVEL_LOG);
        if (levelChannel && levelChannel.type === ChannelType.GuildText) {
          await levelChannel.send({ content: levelUpMessage });
        }
      } catch (err) {
        console.error('Gagal mengirim pesan level up:', err);
      }
    } else {
      console.warn('LEVEL_LOG environment variable belum di-set.');
    }
  }

  await db.write();
};
