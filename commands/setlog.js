const { SlashCommandBuilder, ChannelType } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlog")
    .setDescription("Set a log type to a channel")
    .addStringOption(option =>
      option.setName("type")
        .setDescription("Select the log type")
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
        )
    )
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Select the channel to send logs")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const channel = interaction.options.getChannel("channel");

    let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) {
      config = new GuildConfig({ guildId: interaction.guild.id });
    }

    config.logs[type] = { enabled: true, channelId: channel.id };
    await config.save();

    await interaction.reply({ content: `✅ Log for **${type}** set to ${channel}`, ephemeral: true });
  },
};