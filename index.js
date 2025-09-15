require("dotenv").config();
const fs = require("fs");
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.commands = new Collection();

fs.readdirSync("./commands")
  .filter(f => f.endsWith(".js"))
  .forEach(file => {
    const command = require(`./commands/${file}`);
    if (command?.data?.name && command.execute) client.commands.set(command.data.name, command);
  });

fs.readdirSync("./events")
  .filter(f => f.endsWith(".js"))
  .forEach(file => require(`./events/${file}`)(client));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(console.error);

client.once("clientReady", () => {
  client.user.setActivity("your server logs", { type: "WATCHING" });
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (!interaction.replied) await interaction.reply({ content: "❌ Error executing command.", ephemeral: true });
  }
});

client.login(process.env.TOKEN);