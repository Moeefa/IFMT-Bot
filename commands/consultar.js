const request = require("request");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
  name: "consultar",
  description: "Consulta um aluno no conjunto de dados de acordo com o nome ou número de matrícula.",
  options: [{
    name: "aluno",
    description: "Matrícula ou nome completo do aluno.",
    type: "STRING",
    required: true
  }],
  execute(client, interaction) {
    let type = "";
    (isNaN(Number(interaction.options.getString("aluno")))) ? type = "nome" : type = "matricula";
    
    request(`https://dados.ifmt.edu.br/api/3/action/datastore_search?resource_id=96f114e2-58f9-4f59-9c44-f59814c0b264&q={"${type}":"${encodeURI(interaction.options.getString("aluno"))}"}`, function (error, response, body) {
      /*if (JSON.parse(body).result.total < 1) {
        return interaction.reply("Não achei ninguém no banco de dados! Tente usar o nome completo ou o número de matrícula.");
      } else if (JSON.parse(body).result.total > 1) {
        return interaction.reply("Encontrei mais de 1 resultado na pesquisa, insira o seu nome completo ou o número de matrícula para ser mais preciso.")
      };*/

      let campus = {
        "ALF": "Campus Alta Floresta",
        "BAG": "Campus Barra do Garças",
        "BLV": "Campus Cuiabá - Bela Vista",
        "CAS": "Campus Cáceres",
        "CBA": "Campus Cuiabá",
        "CFS": "Campus Confresa",
        "CNP": "Campus Campo Novo do Parecis",
        "DMT": "Campus Diamantino",
        "GTA": "Campus Avançado Guarantã do Norte",
        "JNA": "Campus Juína",
        "LRV": "Campus Lucas do Rio Verde",
        "PDL": "Campus Primavera do Leste",
        "PLC": "Campus Pontes e Lacerda",
        "ROO": "Campus Rondonópolis",
        "RTR": "Reitoria",
        "SNP": "Campus Avançado Sinop",
        "SRS": "Campus Sorriso",
        "SVC": "Campus São Vicente",
        "TGA": "Campus Tangara da Serra",
        "VGD": "Campus Várzea Grande"
      };
      
      let results = JSON.parse(body).result.records;
      let page = 0;

      const nextBtn = new MessageButton({ style: 'PRIMARY', customId: "nextId", label: "Próxima página" });
      const prevBtn = new MessageButton({ style: 'PRIMARY', customId: "prevId", label: "Página anterior" });
      let ano = new Date().getFullYear() - Number(results[page].matricula.substring(0,4)) + 1
      let current = Number(results[page].matricula.substring(0,4)) + 2
      interaction.reply({ fetchReply: true, content: `Nome: ${results[page].nome}.\nSituação: ${results[page].situacao}.\nCurso: ${results[page].curso}.\nCampus: ${campus[results[page].campus]}.\nMatrícula: ${results[page].matricula}.\nAno previsto de conclusão: ${current < 1900 || isNaN(current) ? "N/A" : current}.\nAno atual previsto: ${ano >= 3 || ano < 1 || isNaN(ano) ? "Formado" : `${ano}º`}.\n\nPágina ${page+1} de ${results.length}.`, components: [new MessageActionRow({components: [prevBtn.setDisabled(true), JSON.parse(body).result.total > 1 ? nextBtn : nextBtn.setDisabled(true)]})] }).then(msg => {
        const collector = msg.createMessageComponentCollector({ filter: ({user}) => user.id === interaction.user.id });
        collector.on("collect", interactionBtn => {
          if (interactionBtn.customId == "prevId") page--
          else page++;
          if (page+1 >= results.length) nextBtn.setDisabled(true)
          else nextBtn.setDisabled(false);
          if (page+1 <= 1) prevBtn.setDisabled(true)
          else prevBtn.setDisabled(false);

          ano = new Date().getFullYear() - Number(results[page].matricula.substring(0,4)) + 1
          current = Number(results[page].matricula.substring(0,4)) + 2
          interactionBtn.update({ content: `Nome: ${results[page].nome}.\nSituação: ${results[page].situacao}.\nCurso: ${results[page].curso}.\nCampus: ${campus[results[page].campus]}.\nMatrícula: ${results[page].matricula}.\nAno previsto de conclusão: ${current < 1900 || isNaN(current) ? "N/A" : current}.\nAno atual previsto: ${ano >= 3 || ano < 1 || isNaN(ano) ? "Formado" : `${ano}º`}.\n\nPágina ${page+1} de ${results.length}.`, components: [new MessageActionRow({components: [prevBtn, nextBtn]})] })
        });
      });
    });
  }
};