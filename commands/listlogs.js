const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listlogs")
    .setDescription("Show log settings"),
  async execute(interaction) {
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    const embed = new EmbedBuilder()
      .setTitle(`📑 Log Settings for ${interaction.guild.name}`)
      .setColor("Blue");
    if (!config || !config.logs) {
      embed.setDescription("No logs configured");
    } else {
      for (const [key, value] of Object.entries(config.logs)) {
        embed.addFields({ name: key, value: `${value.enabled ? "✅ Enabled" : "❌ Disabled"}\nChannel: ${value.channelId ? `<#${value.channelId}>` : "None"}`, inline: false });
      }
    }
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
