const r_eletro = "944299045042679838",
  r_edifica = "944299270683631636",
  r_eventos = "944299148583264346",
  r_secret = "944299200177373265";

const request = require("request");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

const oneButton = new MessageButton({ style: 'SUCCESS', customId: "oneId", label: "1°" });
const twoButton = new MessageButton({ style: 'SUCCESS', customId: "twoId", label: "2°" });
const threeButton = new MessageButton({ style: 'SUCCESS', customId: "threeId", label: "3°" });
const formadoButton = new MessageButton({ style: 'SUCCESS', customId: "formadoId", label: "Formado", emoji: "🎓" });
const notButton = new MessageButton({ style: 'DANGER', customId: "notId", label: "Não faço parte do IFMT" });
const doButton = new MessageButton({ style: 'SUCCESS', customId: "doId", label: "Faço parte do IFMT" });
const eletro = new MessageButton({ style: 'SUCCESS', customId: "eletro", label: "Eletrotécnico/Eletrônica" });
const edificacao = new MessageButton({ style: 'SUCCESS', customId: "edificao", label: "Edificações" });
const eventos = new MessageButton({ style: 'SUCCESS', customId: "eventos", label: "Eventos" });
const secrt = new MessageButton({ style: 'SUCCESS', customId: "secrt", label: "Secretariado" });
const info = new MessageButton({ style: 'SUCCESS', customId: "info", label: "Informática" });

module.exports = {
  name: "registrar",
  description: "Registra o aluno no servidor de acordo com o nome ou número de matrícula.",
  options: [{
    name: "aluno",
    description: "Matrícula ou nome completo do aluno que está se registrando.",
    type: "STRING",
    required: true
  }],
  async execute(client, interaction, message) {
    let type = "";
    if (interaction !== null) {
      (isNaN(Number(interaction.options.getString("aluno")))) ? type = "nome" : type = "matricula";
    } else {
      (isNaN(Number(message.content.replace(`<@${client.user.id}>`, "")))) ? type = "nome" : type = "matricula";
    };

    let guild = client.guilds.cache.get("484178304266403841")
    let member = await guild.members.fetch(interaction?.user.id ?? message.author.id);

    let search = interaction !== null ? interaction.options.getString("aluno") : message.content.replace(`<@${client.user.id}>`, "");
    request(`https://dados.ifmt.edu.br/api/3/action/datastore_search?resource_id=96f114e2-58f9-4f59-9c44-f59814c0b264&q={"${type}":"${encodeURI(search)}"}`, function (error, response, body) {
      if (JSON.parse(body).result.total < 1) {
        let send = interaction || message;
        send.reply({ fetchReply: true, content: "Não achei ninguém no banco de dados! Tente usar o nome completo ou o número de matrícula. Se você faz parte do IFMT e não está no banco de dados (isso acontece porque o banco de dados pode não estar atualizado no momento), clique no botão \"faço parte do IFMT\", e se você não faz parte do IFMT, clique no botão \"não faço parte do IFMT\".", components: [new MessageActionRow({components: [doButton, notButton]})] })
        .then(notMsg => {
          let collectorUser = interaction?.user.id ?? message.author.id;
          const collector = notMsg.createMessageComponentCollector({ filter: ({user}) => user.id === collectorUser });
          collector.on('collect', async interactionButton => {
            if (interactionButton.customId == "doId") {
              if (type == "matricula") return interactionButton.reply("Por favor, rode o comando novamente com o seu nome completo.");              
              let aluno = interaction?.options.getString("aluno") ?? message.content.replace(`<@${client.user.id}>`, "");
              interactionButton.reply({ fetchReply: true, content:`Bem-vindo, ${aluno}! Por favor, selecione o seu curso atual.`, components: [new MessageActionRow({components: [eletro, edificacao, eventos, secrt, info]})]}).then(msg => {
                const collector1 = msg.createMessageComponentCollector({ filter: ({user}) => user.id === collectorUser })
                collector1.on('collect', async interactionButton_ => {
                  if (interactionButton_.customId == "info") {
                    interactionButton_.reply({ fetchReply: true, content:`Bem-vindo, ${aluno}! Por favor, selecione o ano que está cursando.`, components: [new MessageActionRow({components: [oneButton, twoButton, threeButton, formadoButton]})]}).then(msgCurso => {
                      const collector2 = msgCurso.createMessageComponentCollector({ filter: ({user}) => user.id === collectorUser })
                      collector2.on('collect', async interactionButton__ => {
                        let role;
                        switch (interactionButton__.customId) {
                          case "oneId":
                            role = "936824421874806885";
                            break;
                          case "twoId":
                            role = "936824477902311435";
                            break;
                          case "threeId":
                            role = "936824532923203595";
                            break;
                          case "formadoId":
                            role = "944670173779099699";
                            break;
                        };

                        member.roles.add(role, `${aluno} se registrou no servidor.`).then(() => {
                          member.setNickname(`${aluno.split(" ")[0]}${aluno.split(" ")[1]}`, `${aluno} se registrou no servidor.`).catch(() => console.log(`Não consegui mudar o nickname do ${member.id}.`));
                          interactionButton__.reply("Tudo certo! Você acabou de receber o cargo referente ao ano em que está cursando para você acessar o servidor.");
                        }).catch(e => {
                          interactionButton__.reply("Algo deu errado ao tentar dar o cargo, contate um administrador.");
                        });
                      });
                    });
                  } else {
                    let role;
                    switch (interactionButton_.customId) {
                      case "eletro":
                        role = r_eletro;
                        break;
                      case "edificacao":
                        role = r_edifica;
                        break;
                      case "eventos":
                        role = r_eventos;
                        break;
                      case "secrt":
                        role = r_secret;
                        break;
                    };

                    member.roles.add(role, `${aluno} (${interactionButton.label}) se registrou no servidor.`).then(() => {
                      member.setNickname(`${aluno.split(" ")[0]}${aluno.split(" ")[1]}`, `${aluno} (${interactionButton.label}) se registrou no servidor.`).catch(() => console.log(`Não consegui mudar o nickname do ${member.id}.`));
                      interactionButton_.reply("Tudo certo! Você acabou de receber o cargo referente ao seu curso atual para você acessar o servidor.");
                    }).catch(e => {
                      interactionButton_.reply("Algo deu errado ao tentar dar o cargo, contate um administrador.");
                      //throw e;
                    });
                  };
                  return;
                });
              });
            } else {
              let aluno = interaction?.options.getString("aluno") ?? message.content.replace(`<@${client.user.id}>`, "")
              if (aluno.replace(`<@${client.user.id}`, "") == "") return interactionButton.reply("Por favor, rode o comando novamente com o seu nome completo.");
              member.roles.add("936825982474657832", `${aluno.replace(`<@${client.user.id}`, "")} (não faz parte do IFMT) se registrou no servidor.`).then(() => {
                member.setNickname(`${aluno.replace(`<@${client.user.id}`, "").split(" ")[0]}${aluno.replace(`<@${client.user.id}`, "").split(" ")[1]}`, `${aluno.replace(`<@${client.user.id}`, "")} (não faz parte do IFMT) se registrou no servidor.`).catch(() => console.log(`Não consegui mudar o nickname do ${member.id}.`));
                interactionButton.reply("Como você não faz parte do IFMT, você agora tem acesso ao servidor com um cargo especial.");
              }).catch(e => {
                interactionButton.reply("Algo deu errado ao tentar dar o cargo, contate um administrador.");
                //throw e;
              });
            };
          });
        });
        return;
      } else if (JSON.parse(body).result.total > 1) {
        let send = interaction || message;
        return send.reply({ fetchReply: true, content: "Encontrei mais de 1 resultado na pesquisa, insira o seu nome completo ou o número de matrícula para ser mais preciso. Se você não faz parte do IFMT, clique no botão abaixo.", components: [new MessageActionRow({components: [notButton]})] }).then(msgGreater => {
          let collectorUser = interaction?.user.id ?? message.author.id;
          const collector2 = msgGreater.createMessageComponentCollector({ filter: ({user}) => user.id === collectorUser });
          collector2.on('collect', async interactionButton => {
            let aluno = interaction?.options.getString("aluno") ?? message.content.replace(`<@${client.user.id}>`, "")
            if (aluno.replace(`<@${client.user.id}`, "") == "") return interactionButton.reply("Por favor, rode o comando novamente com o seu nome completo.");
            member.roles.add("936825982474657832", `${aluno.replace(`<@${client.user.id}`, "")} (não faz parte do IFMT) se registrou no servidor.`).then(() => {
              member.setNickname(`${aluno.replace(`<@${client.user.id}`, "").split(" ")[0]}${aluno.replace(`<@${client.user.id}`, "").split(" ")[1]}`, `${aluno.replace(`<@${client.user.id}`, "")} (não faz parte do IFMT) se registrou no servidor.`).catch(() => console.log(`Não consegui mudar o nickname do ${member.id}.`));
              interactionButton.reply("Como você não faz parte do IFMT, você agora tem acesso ao servidor com um cargo especial.");
            }).catch(e => {
              interactionButton.reply("Algo deu errado ao tentar dar o cargo, contate um administrador.");
              //throw e;
            });
          });
        });
      };

      let result = JSON.parse(body).result.records[0];

      if (result.campus !== "CBA") {
        member.roles.add("936825982474657832", `${result.nome} (não faz parte do campus) se registrou no servidor.`).then(() => {
          member.setNickname(`${result.nome.split(" ")[0]}${result.nome.split(" ")[1]}`, `${result.nome} (não faz parte do campus) se registrou no servidor.`).catch(() => console.log(`Não consegui mudar o nickname do ${member.id}.`));
          interaction?.reply("Eu detectei que você, " + result.nome + ", não faz parte do campus Cuiabá, sendo assim, você recebeu um cargo especial para ter acesso ao servidor.") ?? message.reply("Eu detectei que você não faz parte do campus de Cuiabá, sendo assim, você recebeu um cargo especial para ter acesso ao servidor.");
        }).catch(e => {
          interaction?.reply("Algo deu errado ao tentar dar o cargo, contate um administrador.") ?? message.reply("Algo deu errado ao tentar dar o cargo, contate um administrador.");
          //throw e;
        });
        return;
      };
      
      if (result.curso !== "Técnico em Informática - Integrado") {
        let detect;
        switch (result.curso) {
          case "Técnico em Eletrotécnica - Integrado":
            detect = r_eletro;
            break;
          case "Técnico em Eletroeletrônica - Integrado":
            detect = r_eletro;
            break;
          case "Técnico em Eletrônica - Integrado":
            detect = r_eletro;
            break;
          case "Técnico em Edificações - Integrado":
            detect = r_edifica;
            break;
          case "Técnico em Secretariado - Integrado":
            detect = r_secret;
            break;
          case "Técnico em Eventos - Integrado":
            detect = r_eventos;
            break;
        };

        if (detect) {
          let send = interaction || message;
          member.roles.add(detect, `${result.nome} se registrou no servidor.`).then(() => {
            member.setNickname(`${result.nome.split(" ")[0]}${result.nome.split(" ")[1]}`, `${result.nome} se registrou no servidor.`).catch(() => console.log(`Não consegui mudar o nickname do ${member.id}.`));
            send.reply({ fetchReply: true, content: "Tudo certo, " + result.nome + "! Você acabou de receber o cargo referente ao seu curso atual para você acessar o servidor. Se não for você e você não faz parte do IFMT, clique no botão abaixo, caso você fizer parte do IFMT e não for você, rode o comando novamente usando sua matrícula ou nome completo para ter mais precisão.", components: [new MessageActionRow({components: [notButton]})] }).then(msgN => {
              let collectorUser = interaction?.user.id ?? message.author.id;
              const collector2 = msgN.createMessageComponentCollector({ filter: ({user}) => user.id === collectorUser });
              collector2.on('collect', async interactionButton => {
                let aluno = interaction?.options.getString("aluno") ?? message.content.replace(`<@${client.user.id}>`, "")
                if (aluno.replace(`<@${client.user.id}`, "") == "") return interactionButton.reply("Por favor, rode o comando novamente com o seu nome completo.");
                member.roles.add("936825982474657832", `${aluno.replace(`<@${client.user.id}`, "")} (não faz parte do IFMT) se registrou no servidor.`).then(() => {
                  member.setNickname(`${aluno.replace(`<@${client.user.id}`, "").split(" ")[0]}${aluno.replace(`<@${client.user.id}`, "").split(" ")[1]}`, `${aluno.replace(`<@${client.user.id}`, "")} (não faz parte do IFMT) se registrou no servidor.`).catch(() => console.log(`Não consegui mudar o nickname do ${member.id}.`));
                  interactionButton.reply("Como você não faz parte do IFMT, você agora tem acesso ao servidor com um cargo especial.");
                }).catch(e => {
                  interactionButton.reply("Algo deu errado ao tentar dar o cargo, contate um administrador.");
                  //throw e;
                });
              });
            });
          }).catch(e => {
            send.reply("Algo deu errado ao tentar dar o cargo, contate um administrador.");
            //throw e;
          });
          return;
        };
        
        let send = interaction || message;
        send.reply({ fetchReply: true, content: "Não consegui detectar seu curso, por favor, escolha o seu curso atual.", components: [new MessageActionRow({components: [eletro, edificacao, eventos, secrt]})] }).then(msg => {
          let collectorUser = interaction?.user.id ?? message.author.id;
          const collector = msg.createMessageComponentCollector({ filter: ({user}) => user.id === collectorUser })
          collector.on('collect', async interactionButton => {
            let role;
            switch (interactionButton.customId) {
              case "eletro":
                role = r_eletro;
                break;
              case "edificacao":
                role = r_edifica;
                break;
              case "eventos":
                role = r_eventos;
                break;
              case "secrt":
                role = r_secret;
                break;
            };
            
            member.roles.add(role, `${result.nome} se registrou no servidor.`).then(() => {
              member.setNickname(`${result.nome.split(" ")[0]}${result.nome.split(" ")[1]}`, `${result.nome} se registrou no servidor.`).catch(() => console.log(`Não consegui mudar o nickname do ${member.id}.`));
              interactionButton.reply("Tudo certo! Você acabou de receber o cargo referente ao seu curso atual para você acessar o servidor.");
            }).catch(e => {
              interactionButton.reply("Algo deu errado ao tentar dar o cargo, contate um administrador.");
              //throw e;
            });
          });
        });
        return;
      };

      let serieAtual = new Date().getFullYear() - Number(result.matricula.substring(0,4)) + 1;
      switch (serieAtual) {
        case 1:
          twoButton.setDisabled(true), threeButton.setDisabled(true), formadoButton.setDisabled(true);
          break;
        case 2:
          threeButton.setDisabled(true), formadoButton.setDisabled(true);
          break;
        case 3:
          formadoButton.setDisabled(true);
          break;
      };

      let send = interaction || message;
      send.reply({ fetchReply: true, content:`Bem-vindo, ${result.nome}! Por favor, selecione o ano em que está cursando.`, components: [new MessageActionRow({components: [oneButton, twoButton, threeButton, formadoButton, notButton]})]}).then(msg => {
        let collectorUser = interaction?.user.id ?? message.author.id;
        const collector = msg.createMessageComponentCollector({ filter: ({user}) => user.id === collectorUser })
        collector.on('collect', async interactionButton => {
          let role;
          switch (interactionButton.customId) {
            case "oneId":
              role = "936824421874806885"; // 1º ano.
              break;
            case "twoId":
              role = "936824477902311435"; // 2º ano.
              break;
            case "threeId":
              role = "936824532923203595"; // 3º ano.
              break;
            case "formadoId":
              role = "944670173779099699";
              break;
          };

          if (interactionButton.customId == "notId") {
            let aluno = interaction?.options.getString("aluno") ?? message.content.replace(`<@${client.user.id}>`, "")
            member.roles.add("936825982474657832", `${aluno} (não faz parte do IFMT) se registrou no servidor.`).then(() => {
              member.setNickname(`${aluno.replace(`<@${client.user.id}`, "").split(" ")[0]}${aluno.replace(`<@${client.user.id}`, "").split(" ")[1]}`, `${aluno.replace(`<@${client.user.id}`, "")} (não faz parte do IFMT) se registrou no servidor.`).catch(() => console.log(`Não consegui mudar o nickname do ${member.id}.`));
              interactionButton.reply("Como você não faz parte do IFMT, você agora tem acesso ao servidor com um cargo especial.");
            }).catch(e => {
              interactionButton.reply("Algo deu errado ao tentar dar o cargo, contate um administrador.");
              //throw e;
            });
            return;
          };

          member.roles.add(role, `${result.nome} se registrou no servidor.`).then(() => {
            member.setNickname(`${result.nome.split(" ")[0]}${result.nome.split(" ")[1]}`, `${result.nome} se registrou no servidor.`).catch(() => console.log(`Não consegui mudar o nickname do ${member.id}.`));
            interactionButton.reply("Tudo certo! Você acabou de receber o cargo referente ao ano em que está cursando para você acessar o servidor.");
          }).catch(e => {
            interactionButton.reply("Algo deu errado ao tentar dar o cargo, contate um administrador.");
            //throw e;
          });
        });
      });
    });
  }
};