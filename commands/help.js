const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("📖 Logger Bot Commands")
      .setDescription("Here are all available commands:")
      .addFields(
        { name: "/setlog", value: "Set a specific log type to a channel", inline: false },
        { name: "/togglelog", value: "Enable or disable a specific log type", inline: false },
        { name: "/listlogs", value: "Show all configured logs and their status", inline: false },
        { name: "/setalllogs", value: "Set all log types to a single channel quickly", inline: false },
        { name: "/help", value: "Show this help message", inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] }); 
  }
};
