const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const Gamedig = require('gamedig');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName('players')
    .setDescription('Shows online Reforger players')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );

    console.log('Commands registered');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'players') {
    try {
      const state = await Gamedig.query({
        type: 'armareforger',
        host: '92.118.16.142',
        port: 2302
      });

      const players = state.players.length
        ? state.players.map(p => p.name).join('\n')
        : 'Nobody online';

      await interaction.reply(
        `Players Online (${state.players.length})\n\n${players}`
      );
    } catch {
      await interaction.reply('Server offline or query failed');
    }
  }
});

client.login(TOKEN);
