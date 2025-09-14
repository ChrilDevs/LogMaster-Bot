const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("LogMaster Bot Commands")
      .setDescription("Here are the commands you can use:")
      .addFields(
        { name: "/setlog", value: "Set a channel for specific logs (Admin only)" },
        { name: "/togglelog", value: "Enable or disable a specific log type" },
        { name: "/listlogs", value: "List all configured logs for this server" },
        { name: "/help", value: "Show this help message" },
        { name: "Tip", value: "You can set all logs to one channel using `/setalllogs`" }
      )
      .setTimestamp()
      .setFooter({ text: "LogMaster v1" });

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.editReply({ embeds: [embed] });
    }
  }
};