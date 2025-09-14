const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listlogs")
    .setDescription("Show the log configuration for this server"),

  async execute(interaction) {
    try {
      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });

      if (!config || !config.logs) {
        return interaction.reply({ content: "⚠️ No logs configured for this server.", ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`📑 Log Settings for ${interaction.guild.name}`)
        .setTimestamp();

      const LOG_TYPES = [
        "messageDelete",
        "messageUpdate",
        "guildMemberAdd",
        "guildMemberRemove",
        "roleCreate",
        "roleUpdate",
        "roleDelete",
        "channelCreate",
        "channelUpdate",
        "channelDelete",
        "emojiCreate",
        "emojiDelete",
        "guildBanAdd",
        "guildBanRemove"
      ];

      LOG_TYPES.forEach(type => {
        const settings = config.logs[type];
        embed.addFields({
          name: `📌 ${type}`,
          value: settings && settings.enabled
            ? `✅ Enabled\n📺 Channel: <#${settings.channelId}>`
            : "❌ Disabled",
          inline: true
        });
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.error("❌ Error in /listlogs:", err);
      await interaction.reply({ content: "❌ Error reading logs.", ephemeral: true });
    }
  }
};
