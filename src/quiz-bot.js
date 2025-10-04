const { Client, IntentsBitField } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ],
  });

  client.on('ready', () => {
    console.log(`✅ Bot is online and ready`);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    if (interaction.commandName === 'quiz') {
        await interaction.deferReply();

        const difficulty = interaction.options.getString("difficulty");
        const type = interaction.options.getString("type");

        try {
        const url = `https://opentdb.com/api.php?amount=1&difficulty=${difficulty}&type=${type}`;
        const response = await axios.get(url);
        const data = response.data.results[0];
        const question = data.question;
        const correctAnswer = data.correct_answer;
        const options = [...data.incorrect_answers, correctAnswer];

        // Shuffle the options
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        await interaction.editReply({
            content: `Question: ${question}\\nOptions: ${options.join(", ")}`,
        });
        } catch (error) {
        console.error(error);
        // Notify the user in case of an error after deferring
        await interaction.followUp("Failed to fetch the question. Please try again.");
        }

        const filter = (m) => m.author.id === interaction.user.id;

        const collector = interaction.channel.createMessageCollector({
        filter,
        time: 15000,
        max: 1,
        });

        collector.on("collect", async (m) => {
        if (m.content.toLowerCase() === correctAnswer.toLowerCase()) {
            await m.reply("Correct answer! 🎉");
        } else {
            await m.reply(`Wrong answer! The correct answer was: ${correctAnswer}`);
        }
        });

        collector.on("end", (collected) => {
        if (collected.size === 0) {
            interaction.followUp("Time is up! No answer was provided.");
        }
        });

    }
   });

client.login(process.env.TOKEN);

   