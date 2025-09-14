const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

const logTypes = [
  "messageDelete",
  "messageUpdate",
  "memberAdd",
  "memberRemove",
  "roleCreate",
  "roleUpdate",
  "roleDelete",
  "channelCreate",
  "channelUpdate",
  "channelDelete",
  "emojiCreate",
  "emojiDelete",
  "banAdd",
  "banRemove"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setalllogs")
    .setDescription("Enable all logs in a specific channel")
    .addChannelOption(opt => opt.setName("channel").setDescription("Channel for all logs").setRequired(true)),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id }) || new GuildConfig({ guildId: interaction.guild.id, logs: {} });

    for (const type of logTypes) {
      config.logs[type] = { enabled: true, channelId: channel.id };
    }

    await config.save();
    await interaction.reply({ content: `✅ All logs have been enabled in ${channel}`, ephemeral: true });
  }
};