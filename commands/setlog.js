const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlog")
    .setDescription("Set a log type in a specific channel")
    .addStringOption(option =>
      option.setName("type")
        .setDescription("Type of log")
        .setRequired(true)
        .addChoices(
          { name: "Message Delete", value: "messageDelete" },
          { name: "Message Update", value: "messageUpdate" },
          { name: "Member Join", value: "memberAdd" },
          { name: "Member Leave", value: "memberRemove" },
          { name: "Role Create", value: "roleCreate" },
          { name: "Role Update", value: "roleUpdate" },
          { name: "Role Delete", value: "roleDelete" },
          { name: "Channel Create", value: "channelCreate" },
          { name: "Channel Update", value: "channelUpdate" },
          { name: "Channel Delete", value: "channelDelete" },
          { name: "Emoji Create", value: "emojiCreate" },
          { name: "Emoji Delete", value: "emojiDelete" },
          { name: "Member Ban", value: "banAdd" },
          { name: "Member Unban", value: "banRemove" }
        ))
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Channel to send logs to")
        .setRequired(true)),
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const channel = interaction.options.getChannel("channel");

    let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) {
      config = new GuildConfig({ guildId: interaction.guild.id, logs: {} });
    }

    config.logs[type] = { enabled: true, channelId: channel.id };
    await config.save();

    await interaction.reply({ content: `✅ Logs for ${type} will be sent in ${channel}`, flags: 64 });
  }
};