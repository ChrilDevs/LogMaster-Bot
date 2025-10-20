const { SlashCommandBuilder, ChannelType } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

const TYPES = [
  "botAdd","botKick",
  "memberAdd","memberRemove","memberKick",
  "banAdd","banRemove",
  "messageDelete","messageUpdate",
  "roleCreate","roleUpdate","roleDelete",
  "channelCreate","channelUpdate","channelDelete",
  "emojiCreate","emojiUpdate","emojiDelete"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setalllogs")
    .setDescription("Enable and set ALL logs to a channel")
    .addChannelOption(o =>
      o.setName("channel").setDescription("Channel for all logs").setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    let cfg = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!cfg) cfg = new GuildConfig({ guildId: interaction.guild.id });

    for (const t of TYPES) cfg.logs[t] = { enabled: true, channelId: channel.id };
    await cfg.save();

    await interaction.reply({ content: `✅ All logs enabled in ${channel}.` });
  }
};