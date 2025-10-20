const { Schema, model } = require("mongoose");

const logSchema = new Schema({
  enabled: { type: Boolean, default: false },
  channelId: { type: String, default: null }
}, { _id: false });

const guildSchema = new Schema({
  guildId: { type: String, unique: true, required: true },
  logs: {
    memberAdd: { type: logSchema, default: () => ({}) },
    memberRemove: { type: logSchema, default: () => ({}) },
    memberKick: { type: logSchema, default: () => ({}) },
    botAdd: { type: logSchema, default: () => ({}) },
    botKick: { type: logSchema, default: () => ({}) },
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
    emojiUpdate: { type: logSchema, default: () => ({}) }
  }
}, { timestamps: true });

module.exports = model("GuildConfig", guildSchema);