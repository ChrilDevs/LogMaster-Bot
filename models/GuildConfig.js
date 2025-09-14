const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  channelId: { type: String, default: null }
});

const GuildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  logs: {
    messageDelete: { type: LogSchema, default: () => ({}) },
    messageUpdate: { type: LogSchema, default: () => ({}) },
    memberAdd: { type: LogSchema, default: () => ({}) },
    memberRemove: { type: LogSchema, default: () => ({}) },
    banAdd: { type: LogSchema, default: () => ({}) },
    banRemove: { type: LogSchema, default: () => ({}) },
    roleCreate: { type: LogSchema, default: () => ({}) },
    roleUpdate: { type: LogSchema, default: () => ({}) },
    roleDelete: { type: LogSchema, default: () => ({}) },
    channelCreate: { type: LogSchema, default: () => ({}) },
    channelUpdate: { type: LogSchema, default: () => ({}) },
    channelDelete: { type: LogSchema, default: () => ({}) },
    emojiCreate: { type: LogSchema, default: () => ({}) },
    emojiDelete: { type: LogSchema, default: () => ({}) },
  }
});

module.exports = mongoose.model("GuildConfig", GuildConfigSchema);