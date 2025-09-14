require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
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
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (!interaction.replied) await interaction.reply({ content: "❌ Error executing command.", flags: 64 });
    else await interaction.followUp({ content: "❌ Error executing command.", flags: 64 });
  }
});

require("./events/loggers")(client);

client.login(process.env.TOKEN);