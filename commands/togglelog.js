const { SlashCommandBuilder } = require("discord.js");
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
    .setName("togglelog")
    .setDescription("Toggle a specific log on/off")
    .addStringOption(o =>
      o.setName("type").setDescription("Log type").setRequired(true)
       .addChoices(...TYPES.map(t => ({ name: t, value: t })))
    ),
  async execute(interaction) {
    const type = interaction.options.getString("type");
    const cfg = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!cfg || !cfg.logs?.[type]) return interaction.reply({ content: "Not configured yet. Use `/setlog` first.", flags: 64 });

    cfg.logs[type].enabled = !cfg.logs[type].enabled;
    await cfg.save();

    await interaction.reply({ content: `🔁 \`${type}\` is now ${cfg.logs[type].enabled ? "✅ enabled" : "❌ disabled"}.` });
  }
};