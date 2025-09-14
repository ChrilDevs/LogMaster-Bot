const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlog")
    .setDescription("Abilita o disabilita un log specifico")
    .addStringOption(option =>
      option.setName("log")
        .setDescription("Il tipo di log")
        .setRequired(true)
        .addChoices(
          { name: "memberAdd", value: "memberAdd" },
          { name: "memberRemove", value: "memberRemove" },
          { name: "banAdd", value: "banAdd" },
          { name: "banRemove", value: "banRemove" },
          { name: "messageDelete", value: "messageDelete" },
          { name: "messageUpdate", value: "messageUpdate" }
        ))
    .addBooleanOption(option =>
      option.setName("enable")
        .setDescription("Abilita o disabilita il log")
        .setRequired(true))
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Il canale dove inviare i log")
        .setRequired(false)),

  async execute(interaction) {
    const logType = interaction.options.getString("log");
    const enable = interaction.options.getBoolean("enable");
    const channel = interaction.options.getChannel("channel");

    let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) {
      config = new GuildConfig({ guildId: interaction.guild.id, logs: {} });
    }

    config.logs[logType] = {
      enabled: enable,
      channelId: channel?.id || config.logs[logType]?.channelId || null
    };

    await config.save();
    await interaction.reply({ content: `✅ Logs per ${logType} aggiornati.`, ephemeral: true });
  },
};
