const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setalllogs")
    .setDescription("Imposta un unico canale per TUTTI i log")
    .addChannelOption(opt =>
      opt.setName("channel")
        .setDescription("Il canale per inviare tutti i log")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    const logTypes = [
      "messageDelete",
      "messageUpdate",
      "banAdd",
      "banRemove",
      "memberAdd",
      "memberRemove"
    ];

    const updates = {};
    for (const type of logTypes) {
      updates[`logs.${type}`] = { channelId: channel.id, enabled: true };
    }

    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $set: updates },
      { upsert: true, new: true }
    );

    await interaction.reply({
      content: `✅ Tutti i log sono stati impostati su ${channel}`,
      flags: 64
    });
  }
};