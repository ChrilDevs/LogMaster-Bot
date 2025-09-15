const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setalllogs")
    .setDescription("Enable all logs in the specified channel")
    .addChannelOption(option => option.setName("channel").setDescription("Channel to send logs").setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const types = ["memberAdd","memberRemove","banAdd","banRemove","messageDelete","messageUpdate","roleCreate","roleUpdate","roleDelete","channelCreate","channelUpdate","channelDelete","emojiCreate","emojiDelete"];
    const updates = Object.fromEntries(types.map(t => [ `logs.${t}`, { enabled: true, channelId: channel.id } ]));
    await GuildConfig.updateOne({ guildId: interaction.guild.id }, { $set: updates }, { upsert: true });
    await interaction.reply({ content: `✅ All logs set to ${channel}`, ephemeral: true });
  }
};