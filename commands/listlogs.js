const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listlogs")
    .setDescription("Show the current log settings"),

  async execute(interaction) {
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) return interaction.reply({ content: "No logs configured yet.", ephemeral: true });

    let msg = `📑 Log Settings for ${interaction.guild.name}\n`;
    for (const [type, data] of Object.entries(config.logs)) {
      msg += `📌 ${type}\n${data.enabled ? "✅ Enabled" : "❌ Disabled"}\n${data.channelId ? `📺 Channel: <#${data.channelId}>\n` : ""}`;
    }

    await interaction.reply({ content: msg, ephemeral: true });
  }
};
