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

const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
  for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
    const cmd = require(path.join(commandsPath, file));
    if (cmd?.data && cmd?.execute) client.commands.set(cmd.data.name, cmd);
  }
}

const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
  for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
    require(path.join(eventsPath, file))(client);
  }
}

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("✅ MongoDB connected");
}).catch(e => console.error("❌ Mongo error:", e));

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity("your server logs", { type: ActivityType.Watching });
  try {
    const body = client.commands.map(c => c.data.toJSON ? c.data.toJSON() : c.data);
    await client.application.commands.set(body);
    console.log("✅ Global commands registered");
  } catch (e) {
    console.warn("⚠️ Command registration failed:", e);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`❌ Error in /${interaction.commandName}:`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: "❌ Error executing command.", flags: 64 });
    }
  }
});

client.login(process.env.TOKEN);