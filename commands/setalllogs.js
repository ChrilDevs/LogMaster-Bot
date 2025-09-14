const GuildConfig = require("../models/GuildConfig");

const ALL_EVENTS = [
  "messageDelete",
  "messageUpdate",
  "memberAdd",
  "memberRemove",
  "roleCreate",
  "roleUpdate",
  "roleDelete",
  "channelCreate",
  "channelUpdate",
  "channelDelete",
  "emojiCreate",
  "emojiDelete",
  "banAdd",
  "banRemove"
];

module.exports = {
  name: "setalllogs",
  description: "Abilita tutti i log in un canale",
  options: [
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

      const channel = interaction.options.getChannel("channel");

      let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!config) {
        config = new GuildConfig({ guildId: interaction.guild.id, logs: {} });
      }

      for (const event of ALL_EVENTS) {
        config.logs[event] = { enabled: true, channelId: channel.id };
      }

      await config.save();
      await interaction.editReply(`✅ Tutti i log sono stati abilitati in ${channel}`);
    } catch (err) {
      console.error("Error in /setalllogs:", err);
      if (!interaction.replied) {
        await interaction.reply({ content: "❌ Errore durante l'esecuzione del comando.", flags: 64 });
      }
    }
  }
};