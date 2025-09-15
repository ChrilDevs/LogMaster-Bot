require("dotenv").config();
const mongoose = require("mongoose");
const GuildConfig = require("./models/GuildConfig");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await GuildConfig.deleteMany({});
    console.log("✅ All guild configs deleted");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });