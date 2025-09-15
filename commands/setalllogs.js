const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setalllogs")
    .setDescription("Enable all logs in the specified channel")
    .addChannelOption(option => option.setName("channel").setDescription("The channel to send logs").setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const logsTypes = ["memberAdd","memberRemove","banAdd","banRemove","messageDelete","messageUpdate","roleCreate","roleUpdate","roleDelete","channelCreate","channelUpdate","channelDelete","emojiCreate","emojiDelete"];
    await GuildConfig.updateOne(
      { guildId: interaction.guild.id },
      { $set: Object.fromEntries(logsTypes.map(type => [ `logs.${type}`, { enabled: true, channelId: channel.id } ])) },
      { upsert: true }
    );
    await interaction.reply({ content: `✅ Tutti i log sono stati impostati su ${channel}`, ephemeral: true });
  }
};