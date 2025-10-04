const { 
    Client, 
    IntentsBitField, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
  } = require('discord.js');
  const axios = require('axios');
  const he = require("he"); // 处理HTML转义
  
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
        const question = he.decode(data.question);
        const correctAnswer = he.decode(data.correct_answer);
        const options = [...data.incorrect_answers.map(he.decode), correctAnswer];
  
        // 打乱选项
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }
  
        // 创建按钮
        const row = new ActionRowBuilder().addComponents(
          options.map((opt, idx) =>
            new ButtonBuilder()
              .setCustomId(`quiz_${idx}`)
              .setLabel(opt)
              .setStyle(ButtonStyle.Primary)
          )
        );
  
        await interaction.editReply({
          content: `**Question:** ${question}`,
          components: [row],
        });
  
        // 等待按钮点击
        const filter = (btnInt) => btnInt.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
          filter,
          time: 15000,
          max: 1,
        });
  
        collector.on("collect", async (btnInt) => {
          const chosen = btnInt.component.label;
          if (chosen === correctAnswer) {
            await btnInt.reply("✅ Correct answer! 🎉");
          } else {
            await btnInt.reply(`❌ Wrong answer! The correct answer was: **${correctAnswer}**`);
          }
        });
  
        collector.on("end", (collected) => {
          if (collected.size === 0) {
            interaction.followUp("⏰ Time is up! No answer was provided.");
          }
        });
  
      } catch (error) {
        console.error(error);
        await interaction.followUp("Failed to fetch the question. Please try again.");
      }
    }
  });
  
  client.login(process.env.TOKEN);
  