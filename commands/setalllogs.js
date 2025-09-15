const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setalllogs")
    .setDescription("Imposta tutti i log in un unico canale")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Il canale in cui inviare tutti i log")
        .setRequired(true)
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    const logTypes = [
      "memberAdd",
      "memberRemove",
      "banAdd",
      "banRemove",
      "messageDelete",
      "messageUpdate"
    ];

    const logsConfig = {};
    for (const type of logTypes) {
      logsConfig[type] = { enabled: true, channelId: channel.id };
    }

    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $set: { logs: logsConfig } },
      { upsert: true }
    );

    await interaction.reply(`✅ Tutti i log sono stati impostati su ${channel}`);
  }
};