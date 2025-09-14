const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("togglelog")
    .setDescription("Enable or disable a specific log type")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName("logtype")
        .setDescription("The type of log to toggle")
        .setRequired(true)
        .addChoices(
          { name: "Message Deleted", value: "messageDelete" },
          { name: "Message Edited", value: "messageUpdate" },
          { name: "Member Joined", value: "guildMemberAdd" },
          { name: "Member Left", value: "guildMemberRemove" },
          { name: "Role Created", value: "roleCreate" },
          { name: "Role Updated", value: "roleUpdate" },
          { name: "Role Deleted", value: "roleDelete" },
          { name: "Channel Created", value: "channelCreate" },
          { name: "Channel Updated", value: "channelUpdate" },
          { name: "Channel Deleted", value: "channelDelete" },
          { name: "Emoji Created", value: "emojiCreate" },
          { name: "Emoji Deleted", value: "emojiDelete" },
          { name: "Ban Added", value: "guildBanAdd" },
          { name: "Ban Removed", value: "guildBanRemove" }
        )
    ),

  async execute(interaction) {
    const logType = interaction.options.getString("logtype");

    try {
      let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!config) {
        return await interaction.reply({
          content: "❌ No log configuration found. Use `/setlog` first.",
          ephemeral: true
        });
      }

      if (!config.logs[logType]) {
        return await interaction.reply({
          content: `❌ Log type **${logType}** has not been set yet. Use /setlog.`,
          ephemeral: true
        });
      }

      config.logs[logType].enabled = !config.logs[logType].enabled;
      await config.save();

      await interaction.reply({
        content: `✅ Log for **${logType}** is now **${config.logs[logType].enabled ? "enabled" : "disabled"}**.`,
        ephemeral: true
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "❌ Error while toggling log configuration.",
        ephemeral: true
      });
    }
  }
};
