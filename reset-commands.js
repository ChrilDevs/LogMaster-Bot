require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  await client.application.commands.set([]);
  console.log("✅ Tutti i comandi globali cancellati!");

  process.exit(0);
});

client.login(process.env.TOKEN);