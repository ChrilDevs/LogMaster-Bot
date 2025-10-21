require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(foldersPath, file));
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`Deploying ${commands.length} commands...`);

    // 👉 Global commands
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Global commands deployed! (possono impiegare fino a 1 ora per apparire)");

  } catch (error) {
    console.error("❌ Error deploying commands:", error);
  }
})();
