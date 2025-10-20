const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

const ORDER = [
  "botAdd","botKick",
  "memberAdd","memberRemove","memberKick",
  "banAdd","banRemove",
  "messageDelete","messageUpdate",
  "roleCreate","roleUpdate","roleDelete",
  "channelCreate","channelUpdate","channelDelete",
  "emojiCreate","emojiUpdate","emojiDelete"
];

function makeEmbed(cfg, guild, page = 0, perPage = 8) {
  const start = page * perPage;
  const slice = ORDER.slice(start, start + perPage);
  const e = new EmbedBuilder()
    .setColor(0x3B82F6)
    .setTitle(`📑 Log Settings — ${guild.name}`)
    .setFooter({ text: `Page ${page + 1} / ${Math.ceil(ORDER.length / perPage)}` });

  for (const t of slice) {
    const v = cfg.logs?.[t];
    const line = v?.enabled ? `✅ Enabled • ${v.channelId ? `<#${v.channelId}>` : "no channel set"}` : "❌ Disabled";
    e.addFields({ name: t, value: line, inline: false });
  }
  return e;
}

function makeButtons(page, maxPages) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("⬅")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("➡")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page === maxPages - 1)
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listlogs")
    .setDescription("List log settings for this server (with pages)"),
  async execute(interaction) {
    const cfg = await GuildConfig.findOne({ guildId: interaction.guild.id });
    if (!cfg) return interaction.reply({ content: "No configuration yet. Use `/setalllogs` or `/setlog`.", flags: 64 });

    let page = 0;
    const perPage = 8;
    const maxPages = Math.ceil(ORDER.length / perPage);

    const embed = makeEmbed(cfg, interaction.guild, page, perPage);
    const row = makeButtons(page, maxPages);

    const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const collector = msg.createMessageComponentCollector({ time: 60_000 });

    collector.on("collect", async i => {
      if (i.user.id !== interaction.user.id) return i.reply({ content: "Not your menu.", flags: 64 });

      if (i.customId === "prev" && page > 0) page--;
      if (i.customId === "next" && page < maxPages - 1) page++;

      const newEmbed = makeEmbed(cfg, interaction.guild, page, perPage);
      const newRow = makeButtons(page, maxPages);

      await i.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on("end", async () => {
      const disabled = makeButtons(page, maxPages);
      disabled.components.forEach(b => b.setDisabled(true));
      await msg.edit({ components: [disabled] });
    });
  }
};