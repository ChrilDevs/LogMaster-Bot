const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setalllogs")
    .setDescription("Abilita tutti i log nel canale selezionato")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Canale dove inviare i log")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    let config = await GuildConfig.findOne({ guildId: interaction.guild.id });

    if (!config) {
      config = new GuildConfig({
        guildId: interaction.guild.id,
        logs: {}
      });
    }

    const logTypes = [
      "memberAdd", "memberRemove", "banAdd", "banRemove",
      "messageDelete", "messageUpdate",
      "roleCreate", "roleUpdate", "roleDelete",
      "channelCreate", "channelUpdate", "channelDelete",
      "emojiCreate", "emojiDelete"
    ];

    for (const type of logTypes) {
      config.logs[type] = { enabled: true, channelId: channel.id };
    }

    await config.save();

    return interaction.reply({
      content: `✅ Tutti i log sono stati abilitati nel canale ${channel}`,
      ephemeral: true
    });
  }
};
