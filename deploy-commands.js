require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("📖 Show help menu"),
  new SlashCommandBuilder()
    .setName("logs")
    .setDescription("📜 Show recent logs"),
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("🏓 Test bot response time"),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Deploying GLOBAL slash commands...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID), // 🌍 GLOBAL
      { body: commands }
    );
    console.log("✅ Global commands deployed! (possono impiegare fino a 1h per apparire ovunque)");
  } catch (err) {
    console.error("❌ Error deploying commands:", err);
  }
})();
