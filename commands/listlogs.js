const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listlogs")
    .setDescription("List all log settings for this server"),
  async execute(interaction) {
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    const embed = new EmbedBuilder()
      .setTitle(`📑 Log Settings for ${interaction.guild.name}`)
      .setColor("Blue");

    const logs = config?.logs || {};
    for (const [key, value] of Object.entries(logs)) {
      embed.addFields({
        name: key,
        value: value?.enabled ? `✅ Enabled\n📺 Channel: <#${value.channelId}>` : "❌ Disabled",
        inline: false
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};