const Discord = require('discord.js');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const leagueAccount = require("./leagueAccount/leagueAccount.js");
const tournament = require("./tournament/tournament.js");


const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessageReactions
  ],
  partials: [
    Partials.Channel
]
}) 

//Starting bot
client.login(process.env.DISCORD_TOKEN);
client.on('ready', async () =>{
    console.log('Bot is Online ! ');
    client.user.setStatus('online');
    client.user.setActivity('discord.js', 'watching');
});


// messageCreates event listener
client.on('messageCreate', async(message) => {
    leagueAccount.processMessage(message, client);
    tournament.processMessage(message, client);
});
