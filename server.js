require('dotenv').config();
const http = require('http');
require('./src/register-commands.js');
require('./src/quiz-bot.js');

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!');
  })
  .listen(3000, () => {
    console.log('Server is ready.');
  });