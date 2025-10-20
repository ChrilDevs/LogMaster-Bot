const { EmbedBuilder, AuditLogEvent, PermissionsBitField, ChannelType } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

const COLORS = {
  green: 0x31C48D,
  red: 0xEF4444,
  orange: 0xF59E0B,
  blue: 0x3B82F6
};

async function fetchExecutor(guild, type, targetId) {
  try {
    const logs = await guild.fetchAuditLogs({ type, limit: 1 });
    const entry = logs.entries.first();
    if (!entry) return null;
    const fresh = Date.now() - (entry.createdTimestamp || 0) < 15000;
    const match = targetId ? (entry.target?.id === targetId) : true;
    if (fresh && match) return entry.executor || null;
    return entry.executor || null;
  } catch {
    return null;
  }
}

async function sendLog(guild, type, embed) {
  try {
    const cfg = await GuildConfig.findOne({ guildId: guild.id });
    const s = cfg?.logs?.[type];
    if (!s?.enabled || !s?.channelId) return;
    const ch = guild.channels.cache.get(s.channelId) || await guild.channels.fetch(s.channelId).catch(() => null);
    if (!ch) return;
    const me = guild.members.me;
    const perms = ch.permissionsFor(me);
    if (!perms?.has(PermissionsBitField.Flags.ViewChannel)) return;
    if (!perms?.has(PermissionsBitField.Flags.SendMessages)) return;
    if (!perms?.has(PermissionsBitField.Flags.EmbedLinks)) return;
    await ch.send({ embeds: [embed] });
  } catch (err) {
    console.error("sendLog error:", err);
  }
}

function styled(authorUser, title, color) {
  return new EmbedBuilder()
    .setColor(color)
    .setAuthor({ name: authorUser?.tag || authorUser?.username || "System", iconURL: authorUser?.displayAvatarURL?.() || null })
    .setTitle(title)
    .setThumbnail(authorUser?.displayAvatarURL?.() || null)
    .setTimestamp();
}

function f(name, value, inline = false) {
  return { name, value: String(value), inline };
}

function chLabel(ch) {
  if (!ch) return "Unknown";
  if (ch.type === ChannelType.GuildText) return `<#${ch.id}>`;
  return `#${ch.name} (${ch.id})`;
}

module.exports = client => {
  client.on("guildMemberAdd", async m => {
    if (m.user.bot) {
      const ex = await fetchExecutor(m.guild, AuditLogEvent.BotAdd, m.user.id);
      const e = styled(m.user, "🤖 Bot Added", COLORS.green)
        .addFields(
          f("Bot", `${m.user} • \`${m.user.tag}\``),
          f("Bot ID", `\`${m.id}\``, true),
          f("Added By", ex ? `${ex} • \`${ex.tag}\`` : "System", true),
          f("Account Created", `<t:${Math.floor(m.user.createdTimestamp / 1000)}:R>`)
        );
      await sendLog(m.guild, "botAdd", e);
      return;
    }
    const e = styled(m.user, "✅ Member Joined", COLORS.green)
      .addFields(
        f("Member", `${m} • \`${m.user.tag}\``),
        f("User ID", `\`${m.id}\``, true),
        f("Account Created", `<t:${Math.floor(m.user.createdTimestamp / 1000)}:R>`, true)
      );
    await sendLog(m.guild, "memberAdd", e);
  });

  client.on("guildMemberRemove", async m => {
    const ex = await fetchExecutor(m.guild, AuditLogEvent.MemberKick, m.id);
    if (ex) {
      if (m.user?.bot) {
        const e = styled(ex, "🤖 Bot Kicked", COLORS.red)
          .addFields(
            f("Bot", `${m.user} • \`${m.user.tag}\``),
            f("Bot ID", `\`${m.id}\``, true),
            f("Kicked By", `${ex} • \`${ex.tag}\``, true)
          );
        await sendLog(m.guild, "botKick", e);
      } else {
        const e = styled(ex, "👢 Member Kicked", COLORS.red)
          .addFields(
            f("User", `${m.user?.tag || "Unknown"} • <@${m.id}>`),
            f("User ID", `\`${m.id}\``, true),
            f("Kicked By", `${ex} • \`${ex.tag}\``, true)
          );
        await sendLog(m.guild, "memberKick", e);
      }
      return;
    }
    const e = styled(m.user, "❌ Member Left", COLORS.red)
      .addFields(f("User", `${m.user?.tag || "Unknown"} • <@${m.id}>`), f("User ID", `\`${m.id}\``, true));
    await sendLog(m.guild, "memberRemove", e);
  });

  client.on("guildBanAdd", async ban => {
    const ex = await fetchExecutor(ban.guild, AuditLogEvent.MemberBanAdd, ban.user.id);
    const e = styled(ex || ban.user, "⛔ Member Banned", COLORS.red)
      .addFields(
        f("User", `${ban.user} • \`${ban.user.tag}\``),
        f("User ID", `\`${ban.user.id}\``, true),
        f("Banned By", ex ? `${ex} • \`${ex.tag}\`` : "System", true)
      );
    await sendLog(ban.guild, "banAdd", e);
  });

  client.on("guildBanRemove", async ban => {
    const ex = await fetchExecutor(ban.guild, AuditLogEvent.MemberBanRemove, ban.user.id);
    const e = styled(ex || ban.user, "✅ Member Unbanned", COLORS.green)
      .addFields(
        f("User", `${ban.user} • \`${ban.user.tag}\``),
        f("User ID", `\`${ban.user.id}\``, true),
        f("Unbanned By", ex ? `${ex} • \`${ex.tag}\`` : "System", true)
      );
    await sendLog(ban.guild, "banRemove", e);
  });

  client.on("messageDelete", async msg => {
    if (!msg?.guild) return;
    const e = styled(msg.author, "🗑️ Message Deleted", COLORS.red)
      .addFields(
        f("Author", msg.author ? `${msg.author} • \`${msg.author.tag}\`` : "Unknown"),
        f("Channel", chLabel(msg.channel), true),
        f("Message ID", `\`${msg.id}\``, true),
        f("Content", msg.content?.slice(0, 1000) || "*No content*")
      );
    await sendLog(msg.guild, "messageDelete", e);
  });

  client.on("messageUpdate", async (oldMsg, newMsg) => {
    if (!newMsg?.guild) return;
    if (oldMsg?.content === newMsg?.content) return;
    const e = styled(newMsg.author, "✏️ Message Edited", COLORS.orange)
      .addFields(
        f("Author", newMsg.author ? `${newMsg.author} • \`${newMsg.author.tag}\`` : "Unknown"),
        f("Channel", chLabel(newMsg.channel), true),
        f("Message ID", `\`${newMsg.id}\``, true),
        f("Before", oldMsg?.content?.slice(0, 1000) || "*No content*"),
        f("After", newMsg?.content?.slice(0, 1000) || "*No content*")
      );
    await sendLog(newMsg.guild, "messageUpdate", e);
  });

  client.on("roleCreate", async role => {
    const ex = await fetchExecutor(role.guild, AuditLogEvent.RoleCreate, role.id);
    const auto = role.managed && role.tags?.botId ? `Auto-created for <@${role.tags.botId}> by Discord` : null;
    const e = new EmbedBuilder()
      .setColor(COLORS.green)
      .setTitle("🆕 Role Created")
      .addFields(
        f("Role", `\`${role.name}\``),
        f("Role ID", `\`${role.id}\``, true),
        f("Created By", ex ? `${ex} • \`${ex.tag}\`` : (auto || "System"), true)
      )
      .setTimestamp();
    await sendLog(role.guild, "roleCreate", e);
  });

  client.on("roleUpdate", async (oldRole, newRole) => {
    const ex = await fetchExecutor(newRole.guild, AuditLogEvent.RoleUpdate, newRole.id);
    const changes = [];
    if (oldRole.name !== newRole.name) changes.push(`Name: \`${oldRole.name}\` → \`${newRole.name}\``);
    if (!oldRole.permissions.equals(newRole.permissions)) changes.push("Permissions updated");
    if (oldRole.color !== newRole.color) changes.push(`Color: ${oldRole.hexColor} → ${newRole.hexColor}`);
    if (!changes.length) return;
    const e = new EmbedBuilder()
      .setColor(COLORS.orange)
      .setTitle("✏️ Role Updated")
      .addFields(
        f("Role", `\`${newRole.name}\``),
        f("Role ID", `\`${newRole.id}\``, true),
        f("Updated By", ex ? `${ex} • \`${ex.tag}\`` : "System", true),
        f("Changes", changes.join("\n"))
      )
      .setTimestamp();
    await sendLog(newRole.guild, "roleUpdate", e);
  });

  client.on("roleDelete", async role => {
    const ex = await fetchExecutor(role.guild, AuditLogEvent.RoleDelete, role.id);
    const e = new EmbedBuilder()
      .setColor(COLORS.red)
      .setTitle("🗑️ Role Deleted")
      .addFields(
        f("Role", `\`${role.name}\``),
        f("Role ID", `\`${role.id}\``, true),
        f("Deleted By", ex ? `${ex} • \`${ex.tag}\`` : "System", true)
      )
      .setTimestamp();
    await sendLog(role.guild, "roleDelete", e);
  });

  client.on("channelCreate", async ch => {
    const ex = await fetchExecutor(ch.guild, AuditLogEvent.ChannelCreate, ch.id);
    const e = new EmbedBuilder()
      .setColor(COLORS.green)
      .setTitle("🆕 Channel Created")
      .addFields(
        f("Channel", `\`${ch.name}\``),
        f("Channel ID", `\`${ch.id}\``, true),
        f("Created By", ex ? `${ex} • \`${ex.tag}\`` : "System", true)
      )
      .setTimestamp();
    await sendLog(ch.guild, "channelCreate", e);
  });

  client.on("channelUpdate", async (oldCh, newCh) => {
    const ex = await fetchExecutor(newCh.guild, AuditLogEvent.ChannelUpdate, newCh.id);
    const changes = [];
    if (oldCh.name !== newCh.name) changes.push(`Name: \`${oldCh.name}\` → \`${newCh.name}\``);
    if (oldCh.topic !== newCh.topic) changes.push(`Topic: ${oldCh.topic || "None"} → ${newCh.topic || "None"}`);
    if (!changes.length) return;
    const e = new EmbedBuilder()
      .setColor(COLORS.orange)
      .setTitle("✏️ Channel Updated")
      .addFields(
        f("Channel", `\`${newCh.name}\``),
        f("Channel ID", `\`${newCh.id}\``, true),
        f("Updated By", ex ? `${ex} • \`${ex.tag}\`` : "System", true),
        f("Changes", changes.join("\n"))
      )
      .setTimestamp();
    await sendLog(newCh.guild, "channelUpdate", e);
  });

  client.on("channelDelete", async ch => {
    const ex = await fetchExecutor(ch.guild, AuditLogEvent.ChannelDelete, ch.id);
    const e = new EmbedBuilder()
      .setColor(COLORS.red)
      .setTitle("🗑️ Channel Deleted")
      .addFields(
        f("Channel", `\`${ch.name}\``),
        f("Channel ID", `\`${ch.id}\``, true),
        f("Deleted By", ex ? `${ex} • \`${ex.tag}\`` : "System", true)
      )
      .setTimestamp();
    await sendLog(ch.guild, "channelDelete", e);
  });

  client.on("emojiCreate", async emoji => {
    const ex = await fetchExecutor(emoji.guild, AuditLogEvent.EmojiCreate, emoji.id);
    const e = new EmbedBuilder()
      .setColor(COLORS.green)
      .setTitle("😀 Emoji Created")
      .addFields(
        f("Name", `\`${emoji.name}\``),
        f("Emoji ID", `\`${emoji.id}\``, true),
        f("Created By", ex ? `${ex} • \`${ex.tag}\`` : "System", true)
      )
      .setTimestamp();
    await sendLog(emoji.guild, "emojiCreate", e);
  });

  client.on("emojiUpdate", async (oldEmoji, newEmoji) => {
    const ex = await fetchExecutor(newEmoji.guild, AuditLogEvent.EmojiUpdate, newEmoji.id);
    const changes = [];
    if (oldEmoji.name !== newEmoji.name) changes.push(`Name: \`${oldEmoji.name}\` → \`${newEmoji.name}\``);
    if (!changes.length) return;
    const e = new EmbedBuilder()
      .setColor(COLORS.orange)
      .setTitle("✏️ Emoji Updated")
      .addFields(
        f("Emoji", `${newEmoji}`),
        f("Emoji ID", `\`${newEmoji.id}\``, true),
        f("Updated By", ex ? `${ex} • \`${ex.tag}\`` : "System", true),
        f("Changes", changes.join("\n"))
      )
      .setTimestamp();
    await sendLog(newEmoji.guild, "emojiUpdate", e);
  });

  client.on("emojiDelete", async emoji => {
    const ex = await fetchExecutor(emoji.guild, AuditLogEvent.EmojiDelete, emoji.id);
    const e = new EmbedBuilder()
      .setColor(COLORS.red)
      .setTitle("❌ Emoji Deleted")
      .addFields(
        f("Name", `\`${emoji.name}\``),
        f("Emoji ID", `\`${emoji.id}\``, true),
        f("Deleted By", ex ? `${ex} • \`${ex.tag}\`` : "System", true)
      )
      .setTimestamp();
    await sendLog(emoji.guild, "emojiDelete", e);
  });
};