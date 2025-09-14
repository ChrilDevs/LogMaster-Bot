const { EmbedBuilder, AuditLogEvent } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

async function sendLog(guild, type, embed) {
  try {
    const config = await GuildConfig.findOne({ guildId: guild.id });
    if (!config || !config.logs[type]?.enabled) return;

    const channelId = config.logs[type].channelId;
    const logChannel = guild.channels.cache.get(channelId);
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
        { name: "User", value: `${member.user.tag} (${member.id})`, inline: false },
        { name: "Account Created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: false }
      )
      .setTimestamp();

    await sendLog(member.guild, "memberAdd", embed);
  });

  client.on("guildMemberRemove", async member => {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("❌ Member Left")
      .setThumbnail(member.user.displayAvatarURL())
      .addFields({ name: "User", value: `${member.user.tag} (${member.id})`, inline: false })
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
        { name: "User", value: `${ban.user.tag} (${ban.user.id})`, inline: false },
        { name: "Banned By", value: entry?.executor ? `${entry.executor.tag} (${entry.executor.id})` : "Unknown", inline: false },
        { name: "Reason", value: entry?.reason || "No reason provided", inline: false }
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
        { name: "User", value: `${ban.user.tag} (${ban.user.id})`, inline: false },
        { name: "Unbanned By", value: entry?.executor ? `${entry.executor.tag} (${entry.executor.id})` : "Unknown", inline: false }
      )
      .setTimestamp();

    await sendLog(ban.guild, "banRemove", embed);
  });

  client.on("messageDelete", async message => {
    if (message.partial) await message.fetch();
    const embed = new EmbedBuilder()
      .setColor("DarkRed")
      .setTitle("🗑️ Message Deleted")
      .setDescription(message.content || "No content")
      .setTimestamp()
      .addFields(
        { name: "Author", value: message.author ? `${message.author.tag} (${message.author.id})` : "Unknown", inline: false },
        { name: "Channel", value: message.channel.name ? `<#${message.channel.id}>` : "Unknown", inline: false }
      );

    await sendLog(message.guild, "messageDelete", embed);
  });

  client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.partial) await oldMessage.fetch();
    if (newMessage.partial) await newMessage.fetch();
    if (oldMessage.content === newMessage.content) return;

    const embed = new EmbedBuilder()
      .setColor("Orange")
      .setTitle("✏️ Message Edited")
      .addFields(
        { name: "Before", value: oldMessage.content || "No content", inline: false },
        { name: "After", value: newMessage.content || "No content", inline: false },
        { name: "Author", value: newMessage.author ? `${newMessage.author.tag} (${newMessage.author.id})` : "Unknown", inline: false },
        { name: "Channel", value: `<#${newMessage.channel.id}>`, inline: false }
      )
      .setTimestamp();

    await sendLog(newMessage.guild, "messageUpdate", embed);
  });
};