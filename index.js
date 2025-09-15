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
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.commands = new Collection();

const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command && command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

fs.readdirSync("./events").filter(f => f.endsWith(".js")).forEach(file => {
  require(`./events/${file}`)(client);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity("your server logs", { type: "WATCHING" });
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: "❌ Error executing command.", ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
