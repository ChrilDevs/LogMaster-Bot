const GuildConfig = require("../models/GuildConfig");

module.exports = {
  name: "setlog",
  description: "Imposta un singolo log",
  options: [
    {
      name: "event",
      type: 3,
      description: "Evento da loggare (es. messageDelete, memberAdd, banAdd)",
      required: true
    },
    {
      name: "channel",
      type: 7,
      description: "Canale dove inviare i log",
      required: true
    }
  ],
  run: async (client, interaction) => {
    try {
      await interaction.deferReply({ flags: 64 });

      const event = interaction.options.getString("event");
      const channel = interaction.options.getChannel("channel");

      let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!config) {
        config = new GuildConfig({ guildId: interaction.guild.id, logs: {} });
      }

      config.logs[event] = { enabled: true, channelId: channel.id };
      await config.save();

      await interaction.editReply(`✅ Logs for **${event}** will be sent in ${channel}`);
    } catch (err) {
      console.error("Error in /setlog:", err);
      if (!interaction.replied) {
        await interaction.reply({ content: "❌ Errore durante l'esecuzione del comando.", flags: 64 });
      }
    }
  }
};
