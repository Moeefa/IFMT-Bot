module.exports = {
  name: "uptime",
  description: "Informa há quanto tempo estou online.",
  execute(client, interaction) {
    
    let totalSeconds = (client.uptime / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);
    
    interaction.reply(`Estou online faz ${hours}:${minutes}:${seconds}!`)
  }
};