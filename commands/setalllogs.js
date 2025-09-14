const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setalllogs")
    .setDescription("Set all logs to a single channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("The channel where all logs will be sent")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    try {
      let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!config) config = new GuildConfig({ guildId: interaction.guild.id, logs: {} });

      if (!config.logs) config.logs = {};

      LOG_TYPES.forEach(type => {
        config.logs[type] = { channelId: channel.id, enabled: true };
      });

      await config.save();

      await interaction.reply({
        content: `✅ All log types have been set to <#${channel.id}>`,
        ephemeral: true
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "❌ Error while setting all logs.",
        ephemeral: true
      });
    }
  }
};