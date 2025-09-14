const mongoose = require("mongoose");

const GuildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  logs: {
    messageDelete: { enabled: Boolean, channelId: String },
    messageUpdate: { enabled: Boolean, channelId: String },
    memberJoin: { enabled: Boolean, channelId: String },
    roleCreate: { enabled: Boolean, channelId: String },
    roleUpdate: { enabled: Boolean, channelId: String },
    roleDelete: { enabled: Boolean, channelId: String },
    channelCreate: { enabled: Boolean, channelId: String },
    channelUpdate: { enabled: Boolean, channelId: String },
    channelDelete: { enabled: Boolean, channelId: String },
    emojiCreate: { enabled: Boolean, channelId: String },
    emojiDelete: { enabled: Boolean, channelId: String },
    ban: { enabled: Boolean, channelId: String },
    unban: { enabled: Boolean, channelId: String }
  }
});

module.exports = mongoose.model("GuildConfig", GuildConfigSchema);
