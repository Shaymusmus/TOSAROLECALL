const express = require('express');
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const Gamedig = require('gamedig');

// keep Render alive
const app = express();
app.get('/', (req, res) => res.send('Bot is running'));
app.listen(10000);

// Discord setup
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// slash command
const commands = [
  new SlashCommandBuilder()
    .setName('players')
    .setDescription('Shows online Reforger players')
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('Slash commands registered');
  } catch (err) {
    console.error(err);
  }
})();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// COMMAND HANDLER (FIXED)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'players') {

    // IMPORTANT: prevents "did not respond"
    await interaction.deferReply();

    try {
      const state = await Gamedig.query({
        type: 'armareforger',
        host: '92.118.16.142',
        port: 2001,
        timeout: 10000
      });

      const players = state.players.length
        ? state.players.map(p => p.name).join('\n')
        : 'Nobody online';

      await interaction.editReply(
        `Players Online (${state.players.length})\n\n${players}`
      );

    } catch (err) {
      console.log(err);

      await interaction.editReply(
        '❌ Could not reach server (wrong IP/port or server not responding to queries)'
      );
    }
  }
});

client.login(TOKEN);
