const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlog")
    .setDescription("Enable a specific log type")
    .addStringOption(option => option
      .setName("type")
      .setDescription("Log type")
      .setRequired(true)
      .addChoices(
        { name: "Member Join", value: "memberAdd" },
        { name: "Member Leave", value: "memberRemove" },
        { name: "Ban Add", value: "banAdd" },
        { name: "Ban Remove", value: "banRemove" },
        { name: "Message Delete", value: "messageDelete" },
        { name: "Message Update", value: "messageUpdate" },
        { name: "Role Create", value: "roleCreate" },
        { name: "Role Update", value: "roleUpdate" },
        { name: "Role Delete", value: "roleDelete" },
        { name: "Channel Create", value: "channelCreate" },
        { name: "Channel Update", value: "channelUpdate" },
        { name: "Channel Delete", value: "channelDelete" },
        { name: "Emoji Create", value: "emojiCreate" },
        { name: "Emoji Delete", value: "emojiDelete" }
      ))
    .addChannelOption(option => option.setName("channel").setDescription("Channel").setRequired(true)),
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const channel = interaction.options.getChannel("channel");
    await GuildConfig.updateOne({ guildId: interaction.guild.id }, { $set: { [`logs.${type}`]: { enabled: true, channelId: channel.id } } }, { upsert: true });
    await interaction.reply({ content: `✅ Log ${type} set to ${channel}`, ephemeral: true });
  }
};