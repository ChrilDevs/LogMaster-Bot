const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

async function sendLog(guild, type, embed) {
  try {
    const config = await GuildConfig.findOne({ guildId: guild.id });
    if (!config || !config.logs[type] || !config.logs[type].enabled) return;
    const logChannel = guild.channels.cache.get(config.logs[type].channelId);
    if (!logChannel) return;
    await logChannel.send({ embeds: [embed] });
  } catch (err) {
    console.error("Error sending log:", err);
  }
}

module.exports = client => {
  client.on("guildMemberAdd", async member => {
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Member Joined")
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "User", value: `${member.user.tag} (${member.id})` },
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }
      )
      .setTimestamp();
    await sendLog(member.guild, "memberAdd", embed);
  });

  client.on("guildMemberRemove", async member => {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("❌ Member Left")
      .setThumbnail(member.user.displayAvatarURL())
      .addFields({ name: "User", value: `${member.user.tag} (${member.id})` })
      .setTimestamp();
    await sendLog(member.guild, "memberRemove", embed);
  });

  client.on("guildBanAdd", async ban => {
    const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
    const entry = logs.entries.first();
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("⛔ Member Banned")
      .setThumbnail(ban.user.displayAvatarURL())
      .addFields(
        { name: "User", value: `${ban.user.tag} (${ban.user.id})` },
        { name: "Banned By", value: entry?.executor ? `${entry.executor.tag} (${entry.executor.id})` : "Unknown" },
        { name: "Reason", value: entry?.reason || "No reason provided" }
      )
      .setTimestamp();
    await sendLog(ban.guild, "banAdd", embed);
  });

  client.on("guildBanRemove", async ban => {
    const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
    const entry = logs.entries.first();
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Member Unbanned")
      .setThumbnail(ban.user.displayAvatarURL())
      .addFields(
        { name: "User", value: `${ban.user.tag} (${ban.user.id})` },
        { name: "Unbanned By", value: entry?.executor ? `${entry.executor.tag} (${entry.executor.id})` : "Unknown" }
      )
      .setTimestamp();
    await sendLog(ban.guild, "banRemove", embed);
  });

  client.on("messageDelete", async message => {
    if (!message.guild || message.partial) return;
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🗑️ Message Deleted")
      .addFields(
        { name: "Author", value: message.author ? `${message.author.tag} (${message.author.id})` : "Unknown" },
        { name: "Content", value: message.content || "No content" }
      )
      .setTimestamp();
    await sendLog(message.guild, "messageDelete", embed);
  });

  client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (!oldMessage.guild || oldMessage.partial) return;
    if (oldMessage.content === newMessage.content) return;
    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("✏️ Message Updated")
      .addFields(
        { name: "Author", value: oldMessage.author ? `${oldMessage.author.tag} (${oldMessage.author.id})` : "Unknown" },
        { name: "Old Content", value: oldMessage.content || "No content" },
        { name: "New Content", value: newMessage.content || "No content" }
      )
      .setTimestamp();
    await sendLog(oldMessage.guild, "messageUpdate", embed);
  });
};