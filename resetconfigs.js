// resetConfigs.js
require("dotenv").config();
const mongoose = require("mongoose");
const GuildConfig = require("./models/GuildConfig");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const result = await GuildConfig.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} guild configurations`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();