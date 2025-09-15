const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

const ALL_LOGS = [
  "memberAdd", "memberRemove", "banAdd", "banRemove",
  "messageDelete", "messageUpdate", "roleCreate", "roleUpdate",
  "roleDelete", "channelCreate", "channelUpdate", "channelDelete",
  "emojiCreate", "emojiDelete"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setalllogs")
    .setDescription("Enable all logs in a specific channel")
    .addChannelOption(opt => opt.setName("channel").setDescription("Channel to send logs").setRequired(true)),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) config = await GuildConfig.create({ guildId: interaction.guild.id, logs: {} });

    for (const log of ALL_LOGS) {
      config.logs[log] = { enabled: true, channelId: channel.id };
    }
    await config.save();

    await interaction.reply({ content: `✅ All logs enabled in ${channel}`, ephemeral: true });
  }
};