const { readdirSync, lstatSync } = require("fs");

module.exports = {
  name: "ajuda",
  description: "Envia detalhes sobre um comando, se não especificado o comando, envia todos comandos disponíveis.",
  options: [{
    name: "comando",
    description: "Nome do comando que deseja buscar.",
    type: "STRING",
    choices: (() => {
      let comm = [];
      readdirSync("./commands/").forEach((file) => {
        if(lstatSync(`./commands/${file}`).isDirectory()) return;
        if (file == "ajuda.js") return comm.push({name: "ajuda", value: "ajuda"})
        let command = require(`../commands/${file}`);
        comm.push({name: command.name, value: command.name});
      });
      return comm;
    })(),
    required: false
  }],
  execute(client, interaction) {
    if (interaction.options.getString("comando")) {
      let command = client.commands.get(interaction.options.getString("comando"));
      if (!command) return interaction.reply("Não achei nenhum comando com esse nome!");

      interaction.reply(`Comando: ${command.name}\nDescrição: ${command.description}`);
    } else {
      let resp = "Comandos disponíveis: ";
      client.commands.forEach(command => {
        console.log(command.name)
        resp += `\`\`/${command.name}\`\`, `
      });
      resp += ".";
      interaction.reply(resp.substring(0, resp.lastIndexOf(', ')) + resp.substring(resp.lastIndexOf(', ')+2) + "\nSe você deseja se registrar no servidor, você pode usar o meu comando de / (barra) do Discord ou me mencionar e após a menção inserir seu número de matrícula ou nome.")
    };
  }
};