const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
      name: 'quiz',
      description:
        'Select difficulty and question type to tailor the quiz experience.',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'difficulty',
          description: "Options include 'easy', 'medium', or 'hard'.",
          required: true,
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'type',
          description:
            " Choose 'multiple' for multiple choice or 'boolean' for true/false",
          required: true,
        },
      ],
    },
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  (async () => {
    try {
      console.log('Started refreshing SLASH (/) commands.');
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      );
      console.log('Successfully reloaded SLASH (/) commands.');
    } catch (error) {
      console.error(error);
    }
  })();