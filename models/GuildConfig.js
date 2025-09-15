const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  channelId: { type: String, default: null }
}, { _id: false });

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, unique: true },
  logs: {
    memberAdd: logSchema,
    memberRemove: logSchema,
    banAdd: logSchema,
    banRemove: logSchema,
    messageDelete: logSchema,
    messageUpdate: logSchema,
    roleCreate: logSchema,
    roleUpdate: logSchema,
    roleDelete: logSchema,
    channelCreate: logSchema,
    channelUpdate: logSchema,
    channelDelete: logSchema,
    emojiCreate: logSchema,
    emojiDelete: logSchema
  }
});

module.exports = mongoose.model("GuildConfig", guildConfigSchema);