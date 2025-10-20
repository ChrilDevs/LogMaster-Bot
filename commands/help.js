const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("How to use LogMaster"),
  async execute(interaction) {
    const e = new EmbedBuilder()
      .setColor(0x3B82F6)
      .setTitle("📖 LogMaster — Help")
      .addFields(
        { name: "/setalllogs <channel>", value: "Enable ALL log types to one channel." },
        { name: "/setlog <type> <channel> <enabled>", value: "Configure a single log type: channel and on/off." },
        { name: "/togglelog <type>", value: "Enable or disable a specific log without changing channel." },
        { name: "/listlogs", value: "Show current configuration and channels." }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [e] });
  }
};