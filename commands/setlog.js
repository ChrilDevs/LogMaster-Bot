const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlog")
    .setDescription("Set a specific log in a channel")
    .addStringOption(opt => opt.setName("type").setDescription("Log type").setRequired(true))
    .addChannelOption(opt => opt.setName("channel").setDescription("Channel for logs").setRequired(true)),

  async execute(interaction) {
    const type = interaction.options.getString("type");
    const channel = interaction.options.getChannel("channel");

    const config = await GuildConfig.findOne({ guildId: interaction.guild.id }) || new GuildConfig({ guildId: interaction.guild.id, logs: {} });
    config.logs[type] = { enabled: true, channelId: channel.id };
    await config.save();

    await interaction.reply({ content: `✅ Logs for ${type} will be sent in ${channel}`, ephemeral: true });
  }
};