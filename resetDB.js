require("dotenv").config();
const mongoose = require("mongoose");
const GuildConfig = require("./models/GuildConfig");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    const result = await GuildConfig.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} guild configurations`);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });