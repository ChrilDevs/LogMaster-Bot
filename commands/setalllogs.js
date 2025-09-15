const { SlashCommandBuilder, ChannelType } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setalllogs")
    .setDescription("Set all logs to a channel")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Select the channel to send all logs")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) {
      config = new GuildConfig({ guildId: interaction.guild.id });
    }

    for (const key of Object.keys(config.logs)) {
      config.logs[key] = { enabled: true, channelId: channel.id };
    }

    await config.save();
    await interaction.reply({ content: `✅ All logs have been set to ${channel}`, ephemeral: true });
  },
};