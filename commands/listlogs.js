const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listlogs")
    .setDescription("Show all log settings"),
  async execute(interaction) {
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) return interaction.reply({ content: "❌ No logs configured.", flags: 64 });

    const embed = new EmbedBuilder()
      .setTitle(`📑 Log Settings for ${interaction.guild.name}`)
      .setColor("Blue");

    for (const [type, info] of Object.entries(config.logs)) {
      embed.addFields({
        name: type,
        value: `${info.enabled ? "✅ Enabled" : "❌ Disabled"}${info.channelId ? `\n📺 Channel: <#${info.channelId}>` : ""}`,
        inline: false
      });
    }

    await interaction.reply({ embeds: [embed] });
  }
};