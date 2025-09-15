const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listlogs")
    .setDescription("Mostra i canali configurati per i log"),

  async execute(interaction) {
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });

    if (!config || !config.logs) {
      return interaction.reply({
        content: "❌ Nessun log configurato.",
        flags: 64
      });
    }

    const fields = Object.entries(config.logs).map(([type, data]) => ({
      name: type,
      value: data.enabled ? `<#${data.channelId}>` : "❌ Disabilitato",
      inline: true
    }));

    const embed = new EmbedBuilder()
      .setTitle("📋 Log configurati")
      .addFields(fields)
      .setColor("Blue")
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};