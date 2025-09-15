require("dotenv").config();
const mongoose = require("mongoose");
const GuildConfig = require("./models/GuildConfig");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

async function resetConfigs() {
  const allConfigs = await GuildConfig.find({});
  for (const config of allConfigs) {
    const oldLogs = config.logs;

    const newLogs = {
      memberAdd: oldLogs.guildMemberAdd || { enabled: false, channelId: null },
      memberRemove: oldLogs.guildMemberRemove || { enabled: false, channelId: null },
      banAdd: oldLogs.guildBanAdd || { enabled: false, channelId: null },
      banRemove: oldLogs.guildBanRemove || { enabled: false, channelId: null },
      messageDelete: oldLogs.messageDelete || { enabled: false, channelId: null },
      messageUpdate: oldLogs.messageUpdate || { enabled: false, channelId: null },
      roleCreate: oldLogs.roleCreate || { enabled: false, channelId: null },
      roleUpdate: oldLogs.roleUpdate || { enabled: false, channelId: null },
      roleDelete: oldLogs.roleDelete || { enabled: false, channelId: null },
      channelCreate: oldLogs.channelCreate || { enabled: false, channelId: null },
      channelUpdate: oldLogs.channelUpdate || { enabled: false, channelId: null },
      channelDelete: oldLogs.channelDelete || { enabled: false, channelId: null },
      emojiCreate: oldLogs.emojiCreate || { enabled: false, channelId: null },
      emojiDelete: oldLogs.emojiDelete || { enabled: false, channelId: null }
    };

    config.logs = newLogs;
    await config.save();
    console.log(`✅ Config updated for guild ${config.guildId}`);
  }

  console.log("✅ All guild configs updated!");
  mongoose.disconnect();
}

resetConfigs().catch(err => console.error(err));