const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlog")
    .setDescription("Set a log channel for a specific log type")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName("logtype")
        .setDescription("Select the type of log to configure")
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
    )
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("The channel where logs will be sent")
        .setRequired(true)
    ),

  async execute(interaction) {
    const logType = interaction.options.getString("logtype");
    const channel = interaction.options.getChannel("channel");

    try {

      let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!config) {
        config = new GuildConfig({ guildId: interaction.guild.id, logs: {} });
      }

      if (!config.logs) config.logs = {};

      config.logs[logType] = { channelId: channel.id, enabled: true };
      await config.save();

      await interaction.reply({
        content: `✅ Log for **${logType}** set to <#${channel.id}>`,
        ephemeral: true
      });
    } catch (err) {
      console.error("❌ Error in /setlog:", err);
      await interaction.reply({
        content: "❌ Error while saving log configuration.",
        ephemeral: true
      });
    }
  }
};
