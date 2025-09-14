require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildBans
  ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

require("./events/loggers")(client);

mongoose.connect(process.env.MONGO_URI, { dbName: "logmaster" })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(console.error);

client.once("clientReady", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity("LogMaster v1", { type: "PLAYING" });

  try {
    await client.application.commands.set(client.commands.map(cmd => cmd.data));
    console.log("✅ Global commands registered");
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(`❌ Error executing command ${interaction.commandName}:`, err);
    if (!interaction.replied) {
      await interaction.reply({ content: "❌ Error executing command.", ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);