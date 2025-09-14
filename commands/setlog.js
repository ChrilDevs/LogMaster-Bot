const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlog")
    .setDescription("Set a channel for specific logs")
    .addStringOption(option =>
      option.setName("type")
        .setDescription("Choose the log type")
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
          { name: "Member Banned", value: "guildBanAdd" },
          { name: "Member Unbanned", value: "guildBanRemove" }
        ))
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Channel to send logs")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const logType = interaction.options.getString("type");
    const channel = interaction.options.getChannel("channel");

    let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) {
      config = new GuildConfig({ guildId: interaction.guild.id, logs: {} });
    }

    if (!config.logs) config.logs = {};
    if (!config.logs[logType]) config.logs[logType] = {};

    config.logs[logType].enabled = true;
    config.logs[logType].channelId = channel.id;

    await config.save();

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: `✅ Logs for **${logType}** will be sent in ${channel}`, ephemeral: true });
    } else {
      await interaction.followUp({ content: `✅ Logs for **${logType}** will be sent in ${channel}`, ephemeral: true });
    }
  }
};