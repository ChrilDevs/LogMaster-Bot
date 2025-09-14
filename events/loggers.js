const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

async function sendLog(guild, logType, embed) {
  try {
    const config = await GuildConfig.findOne({ guildId: guild.id });
    if (!config || !config.logs[logType] || !config.logs[logType].enabled) return;

    const logChannel = guild.channels.cache.get(config.logs[logType].channelId);
    if (!logChannel) return;

    await logChannel.send({ embeds: [embed] });
  } catch (err) {
    console.error("Error sending log:", err);
  }
}

module.exports = client => {
  client.on("messageDelete", async message => {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("🗑️ Message Deleted")
      .addFields({ name: "Author", value: `${message.author?.tag || "Unknown"}`, inline: true })
      .addFields({ name: "Content", value: message.content || "No content", inline: false })
      .setTimestamp();
    await sendLog(message.guild, "messageDelete", embed);
  });

  client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.content === newMessage.content) return;
    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("✏️ Message Edited")
      .addFields({ name: "Author", value: `${oldMessage.author?.tag || "Unknown"}`, inline: true })
      .addFields({ name: "Before", value: oldMessage.content || "No content", inline: false })
      .addFields({ name: "After", value: newMessage.content || "No content", inline: false })
      .setTimestamp();
    await sendLog(newMessage.guild, "messageUpdate", embed);
  });

  client.on("guildMemberAdd", async member => {
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Member Joined")
      .addFields(
        { name: "User", value: `${member.user.tag} (${member.id})`, inline: false },
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:R>`, inline: false }
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();
    await sendLog(member.guild, "guildMemberAdd", embed);
  });

  client.on("guildMemberRemove", async member => {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("❌ Member Left")
      .addFields({ name: "User", value: `${member.user.tag} (${member.id})`, inline: false })
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();
    await sendLog(member.guild, "guildMemberRemove", embed);
  });

  client.on("guildBanAdd", async ban => {
    const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
    const entry = logs.entries.first();
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("⛔ Member Banned")
      .addFields(
        { name: "User", value: `${ban.user.tag} (${ban.user.id})`, inline: false },
        { name: "Banned By", value: entry?.executor ? `${entry.executor.tag} (${entry.executor.id})` : "Unknown", inline: false },
        { name: "Reason", value: entry?.reason || "No reason provided", inline: false }
      )
      .setThumbnail(ban.user.displayAvatarURL())
      .setTimestamp();
    await sendLog(ban.guild, "guildBanAdd", embed);
  });

  client.on("guildBanRemove", async ban => {
    const logs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
    const entry = logs.entries.first();
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Member Unbanned")
      .addFields(
        { name: "User", value: `${ban.user.tag} (${ban.user.id})`, inline: false },
        { name: "Unbanned By", value: entry?.executor ? `${entry.executor.tag} (${entry.executor.id})` : "Unknown", inline: false }
      )
      .setThumbnail(ban.user.displayAvatarURL())
      .setTimestamp();
    await sendLog(ban.guild, "guildBanRemove", embed);
  });
};