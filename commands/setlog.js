const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlog")
    .setDescription("Imposta un canale per un tipo di log")
    .addStringOption(opt =>
      opt.setName("type")
        .setDescription("Il tipo di log da impostare")
        .setRequired(true)
        .addChoices(
          { name: "Messaggi Eliminati", value: "messageDelete" },
          { name: "Messaggi Modificati", value: "messageUpdate" },
          { name: "Utenti Bannati", value: "banAdd" },
          { name: "Utenti Sbannati", value: "banRemove" },
          { name: "Utenti Entrati", value: "memberAdd" },
          { name: "Utenti Usciti", value: "memberRemove" }
        )
    )
    .addChannelOption(opt =>
      opt.setName("channel")
        .setDescription("Il canale per inviare i log")
        .setRequired(true)
    ),

  async execute(interaction) {
    const type = interaction.options.getString("type");
    const channel = interaction.options.getChannel("channel");

    await GuildConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { $set: { [`logs.${type}`]: { channelId: channel.id, enabled: true } } },
      { upsert: true, new: true }
    );

    await interaction.reply({
      content: `✅ Log **${type}** impostato su ${channel}`,
      flags: 64
    });
  }
};