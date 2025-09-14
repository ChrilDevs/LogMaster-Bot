const mongoose = require("mongoose");
const GuildConfig = require("./models/GuildConfig");
require("dotenv").config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const res = await GuildConfig.deleteMany({});
    console.log(`✅ Cancellati ${res.deletedCount} documenti`);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
})();