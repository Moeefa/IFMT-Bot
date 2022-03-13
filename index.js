const { Client, Intents, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const Discord = require("discord.js");
const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "DIRECT_MESSAGES"],
  partials: ["CHANNEL"]
});
const { readdirSync, lstatSync } = require("fs");

// Express
require("./server.js");

// Discord.js

client.commands = new Discord.Collection();
client.updatePresence = function() {
  var act = [
    ["cba.ifmt.edu.br", "WATCHING"],
    ["Calouros podem demorar para serem inseridos no conjunto de dados.", "STREAMING"],
    ["Usamos um conjunto de dados público providenciado pelo IFMT!", "STREAMING"]
  ];
  var rnd = act[Math.floor(Math.random() * act.length)];
  client.user.setActivity(rnd[0], {
    type: rnd[1]
  });
};

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (message.author.id == client.user.id) return;
  if (message.content.indexOf("<@936664753642827777>") == 0 || message.content.indexOf("<@!936664753642827777>") == 0) {
    message.content = message.content.replace("<@936664753642827777>", "").replace("<@!936664753642827777>", "");
    if (message.content == "") return message.reply("Se você deseja se registrar no servidor, você pode usar o meu comando de / (barra) do Discord ou me mencionar e após a menção inserir seu número de matrícula ou nome.");
    require("./commands/registrar.js").execute(client, null, message);
  } else {
    return;
  };
});

client.on("ready", () => {
  client.user.setActivity("Estou online de novo!", { type: "STREAMING" });
  console.log("\x1b[32mConnected as " + client.user.username + "#" + client.user.discriminator + ".\x1b[0m")
  setTimeout(() => {
    client.updatePresence()
  }, 120000);
  setInterval(() => {
    client.updatePresence();
  }, 120000);

  /*client.application.commands.fetch().then(key => {
    key.forEach(command => {
      client.application.commands.delete(command.id);
    })
  });*/

  readdirSync("./commands/").forEach((file) => {
    if(lstatSync(`./commands/${file}`).isDirectory()) return;
    let command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
    client.application.commands.create({
      name: command.name, 
      description: command.description,
      options: command.options
    });
  });
  
  client.on('interactionCreate', async (interaction) => { 
    if (!interaction.isCommand()) return;
    const { commandName, options } = interaction;
    let command = client.commands.get(commandName);
    if (!command) return;
    
    command.execute(client, interaction, null);
  });
});

client.login(process.env.TOKEN);