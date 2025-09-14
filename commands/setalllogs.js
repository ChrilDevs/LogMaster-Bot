const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

const logTypes = ["memberAdd", "memberRemove", "banAdd", "banRemove", "messageDelete", "messageUpdate"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setalllogs")
    .setDescription("Abilita tutti i log e imposta lo stesso canale")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Canale dove inviare tutti i log")
        .setRequired(true)),

  async execute(interaction) {
    let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config) config = new GuildConfig({ guildId: interaction.guild.id, logs: {} });

    for (const type of logTypes) {
      config.logs[type] = { enabled: true, channelId: interaction.options.getChannel("channel").id };
    }

    await config.save();
    await interaction.reply({ content: `✅ Tutti i log abilitati in <#${interaction.options.getChannel("channel").id}>`, ephemeral: true });
  },
};
