require("dotenv").config();
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.run(client, interaction);
  } catch (err) {
    console.error(`❌ Error executing command ${interaction.commandName}:`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: "❌ Errore durante l'esecuzione del comando.", flags: 64 });
    } else {
      await interaction.editReply({ content: "❌ Errore durante l'esecuzione del comando." });
    }
  }
});

require("./handlers/loggers")(client);


client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: "monitoring logs", type: 0 }],
    status: "online"
  });


});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

client.login(process.env.TOKEN);
