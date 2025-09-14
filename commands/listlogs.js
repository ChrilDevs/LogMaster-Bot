const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listlogs")
    .setDescription("Mostra tutti i log abilitati per il server"),

  async execute(interaction) {
    const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!config || !config.logs) return interaction.reply({ content: "❌ Nessuna configurazione log trovata.", ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle(`📑 Log Settings per ${interaction.guild.name}`)
      .setColor("Blue");

    for (const [key, value] of Object.entries(config.logs)) {
      embed.addFields({
        name: key,
        value: `${value.enabled ? "✅ Enabled" : "❌ Disabled"}${value.channelId ? `\n📺 <#${value.channelId}>` : ""}`,
        inline: false
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
