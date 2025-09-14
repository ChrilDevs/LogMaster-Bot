const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  channelId: { type: String, default: null }
});

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  logs: {
    memberAdd: { type: logSchema, default: () => ({}) },
    memberRemove: { type: logSchema, default: () => ({}) },
    banAdd: { type: logSchema, default: () => ({}) },
    banRemove: { type: logSchema, default: () => ({}) },
    messageDelete: { type: logSchema, default: () => ({}) },
    messageUpdate: { type: logSchema, default: () => ({}) },
    roleCreate: { type: logSchema, default: () => ({}) },
    roleUpdate: { type: logSchema, default: () => ({}) },
    roleDelete: { type: logSchema, default: () => ({}) },
    channelCreate: { type: logSchema, default: () => ({}) },
    channelUpdate: { type: logSchema, default: () => ({}) },
    channelDelete: { type: logSchema, default: () => ({}) },
    emojiCreate: { type: logSchema, default: () => ({}) },
    emojiDelete: { type: logSchema, default: () => ({}) },
  }
});

module.exports = mongoose.model("GuildConfig", guildConfigSchema);