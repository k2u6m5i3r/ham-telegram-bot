var fetch = require('node-fetch');

const token = require('./tokenBotTest.js');
/*
  в файле tokenBotTest.js
  module.exports = {
  tockenF() {
      return  'токен из бот BotFather'
    }
}
*/
const TelegramBot = require('node-telegram-bot-api');
const chatIdUsers = require('./fullListUsers.js');
/*
в файле fullListUsers.js
module.exports = {
  users() {
    let users = [];
    users.push(XXXXXX);// админ в 0ой ячейке.  XXXXXX - ChatId 
    // добавить вручную
    return users;
  }
}
*/
let callsign = "\"EW8MKU\"";
let startMessage = "SDR in Gomel EW8MKU\n";
let otpavlyal = false;


const bot = new TelegramBot(token.tockenF(), { polling: true });
let objFullDBCurrent = {};      // получил с текущего запроса позывные
let objFullDBOld = {};          // старая база
let objFullDBShow = {};         // показать новое если есть разница

// массив ChatID это пользователи которые будут получать сообщения. в 0-ячейке находится админ он может всем рассылать сообщнения вручную всем
let users = chatIdUsers.users();

bot.setMyCommands([
    { command: '/start', description: 'Начать получать информацию!. Проверить что бот работает, можно отправить сообщение и в ответ получить его копию.' },
    { command: '/reg', description: 'Регистрация не работает! Записываю кому отправлять вручную.' },
])
bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    bot.sendMessage(chatId, resp);
});
bot.onText(/\/register/, (msg, match) => {
    const chatId = msg.chat.id
    // users.push(chatId)
    // console.log('user registered')
    // bot.sendMessage(chatId, 'Done.')
})
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    users.push(chatId);
    console.log(msg);
    bot.sendMessage(chatId, `Ты написал вот это ${msg.text}`);
    if (msg.text == '//start') {

    }
    if (msg.text.slice(0, 8) == '/sendall') {
        if(chatId == users[0]){
            sendMessageAll(msg.text.slice(8));
        }   
    }

});
function sendMessage(mdg, chatId) {
    let ans = bot.sendMessage(chatId, mdg);
    ans.then(
        result => {
            console.log("GOOD answer");
            console.log(result.chat.username);
            console.log(result.text);
        },
        error => {
            console.log("ERRROR answer");
            // console.log(error);
        }
    )
}
function sendMessageAll(message) {
    for (let i = 0; i < users.length; i++) {
        sendMessage(message, users[i]);
    }
    console.log("Отправленно всем!");
}
function parsingCallsign(params) {
    let obj = {};
    obj.receiverCallsign = params[1].split("=")[1].slice(1, -1);
    obj.receiverLocator = params[2].split("=")[1].slice(1, -1);
    obj.senderCallsign = params[3].split("=")[1].slice(1, -1);
    obj.senderLocator = params[4].split("=")[1].slice(1, -1);
    obj.frequency = params[5].split("=")[1].slice(1, -1);
    obj.flowStartSeconds = params[6].split("=")[1].slice(1, -1);
    obj.mode = params[7].split("=")[1].slice(1, -1);
    obj.isSend = false;
    obj.inSendingToBot = `${obj.senderCallsign} ${obj.senderLocator} ${obj.mode}`;
    return obj;
}
setInterval(function () {
    console.log("MINUTs");
}, 60 * 1000)
