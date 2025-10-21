require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Partials, ActivityType } = require("discord.js");
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.commands = new Collection();

// === Load commands ===
const commandsPath = path.join(__dirname, "commands");
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
  const cmd = require(path.join(commandsPath, file));
  if (cmd?.data && cmd?.execute) client.commands.set(cmd.data.name, cmd);
}

// === Load events ===
const eventsPath = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
  require(path.join(eventsPath, file))(client);
}

// === MongoDB ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(e => console.error("❌ MongoDB error:", e));

// === Ready ===
client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity("your server logs", { type: ActivityType.Watching });
});

// === Slash commands ===
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`❌ Error in /${interaction.commandName}:`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: "❌ Error executing command.", ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
