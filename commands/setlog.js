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
    .setName("setlog")
    .setDescription("Set a specific log type to a channel and enable/disable it")
    .addStringOption(o =>
      o.setName("type").setDescription("Log type").setRequired(true)
       .addChoices(...TYPES.map(t => ({ name: t, value: t })))
    )
    .addChannelOption(o =>
      o.setName("channel").setDescription("Channel to send logs").setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addBooleanOption(o =>
      o.setName("enabled").setDescription("Enable this log?").setRequired(true)
    ),
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const channel = interaction.options.getChannel("channel");
    const enabled = interaction.options.getBoolean("enabled");

    let cfg = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!cfg) cfg = new GuildConfig({ guildId: interaction.guild.id });

    cfg.logs[type] = { enabled, channelId: channel.id };
    await cfg.save();

    await interaction.reply({ content: `✅ \`${type}\` is now ${enabled ? "enabled" : "disabled"} in ${channel}.` });
  }
};
