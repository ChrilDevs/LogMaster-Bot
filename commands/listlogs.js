const { EmbedBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  name: "listlogs",
  description: "Mostra tutti i log configurati nel server",
  run: async (client, interaction) => {
    try {
      await interaction.deferReply({ flags: 64 }); // ephemeral = flags: 64

      const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!config || !config.logs) {
        return interaction.editReply("⚠️ Nessuna configurazione trovata.");
      }

      const embed = new EmbedBuilder()
        .setTitle(`📑 Log Settings for ${interaction.guild.name}`)
        .setColor("Blue");

      for (const [logType, logConfig] of Object.entries(config.logs)) {
        embed.addFields({
          name: `📌 ${logType}`,
          value: logConfig.enabled
            ? `✅ Enabled\n📺 Channel: <#${logConfig.channelId}>`
            : "❌ Disabled",
          inline: false
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error("Error in /listlogs:", err);
      if (!interaction.replied) {
        await interaction.reply({ content: "❌ Errore durante l'esecuzione del comando.", flags: 64 });
      }
    }
  }
};