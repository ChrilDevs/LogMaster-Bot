const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listlogs")
    .setDescription("List all current log settings"),

  async execute(interaction) {
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    const embed = new EmbedBuilder().setTitle(`📑 Log Settings for ${interaction.guild.name}`).setColor("Blue");

    const allLogs = [
      "memberAdd", "memberRemove", "banAdd", "banRemove",
      "messageDelete", "messageUpdate", "roleCreate", "roleUpdate",
      "roleDelete", "channelCreate", "channelUpdate", "channelDelete",
      "emojiCreate", "emojiDelete"
    ];

    for (const log of allLogs) {
      const data = config?.logs[log];
      embed.addFields({
        name: log,
        value: `${data?.enabled ? "✅ Enabled" : "❌ Disabled"}${data?.channelId ? `\n📺 Channel: <#${data.channelId}>` : ""}`
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};