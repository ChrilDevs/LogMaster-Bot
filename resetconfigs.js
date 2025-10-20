require("dotenv").config();
const mongoose = require("mongoose");
const GuildConfig = require("./models/GuildConfig");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    const res = await GuildConfig.deleteMany({});
    console.log(`🗑️ Deleted ${res.deletedCount} guild configurations`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
