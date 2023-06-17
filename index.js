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
    admins() {
    let admins = [];
    admins.push(XXXXXX);// админ в 0ой ячейке.  XXXXXX - ChatId 
    // добавить вручную
    return admins;
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
// добавил adminОв отдельным массивом пользователей 
let admins = chatIdUsers.admins();

///*
bot.setMyCommands([
    { command: '/start', description: 'Что может бот?' },
    { command: '/register', description: 'Получать уведомление' },
    { command: '/unreg', description: 'Не  получать уведомления' },
])
bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    bot.sendMessage(chatId, resp);
});
bot.onText(/\/register/, (msg, match) => {
    const chatId = msg.chat.id
    // users.push(chatId)
    console.log('user registered')
    bot.sendMessage(chatId, 'Done.')
    if (users.includes(chatId)) {
        console.log("Уже есть в базе");
        bot.sendMessage(chatId, `Уже есть в базе. Для отписки выполнить /unreg`);
    } else {
        console.log("Вношу в базу");
        users.push(chatId)
        bot.sendMessage(chatId, `Будет приходить оповещение! Для отписки выполнить /unreg`);
    }
})
bot.onText(/\/unreg/, (msg, match) => {
    const chatId = msg.chat.id
    // users.push(chatId)
    console.log('user unregistered')
    console.log("Отписка");
    if (users.includes(chatId)) {
        users.splice(users.indexOf(chatId), 1);
        bot.sendMessage(chatId, `Отписал. Чтобы получать уведомление перейди /register.)`);
    } else {
        bot.sendMessage(chatId, `Не получаешь уведомления. Чтобы получать уведомление перейди /register.)`);
    }

})
bot.onText(/\/save/, (msg, match) => {
    const chatId = msg.chat.id
    // users.push(chatId)
    if (chatId == users[0]) {
        console.log('save BD');
        console.log(`${users}`);
    }
})
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    // users.push(chatId); // ошибка исправить
    console.log(msg);

    if (msg.text.slice(0, 1) == '/') {//команды управления!
        if (msg.text == '/start') {
            bot.sendMessage(chatId, ` 1. Бот может повторить сообщение которое Вы написали.\n2. Оповещать о прохождении на 2м(если мой SDR примет цифру FT8, FT4 - придёт сообщение от бота, что на УКВ 144МГц есть активность)(если Вы подпишитесь, пункт меню /register)\n3. Отписаться от оповещения пункт меню /unreg.\n4. Можно задать вопросы. Пишите сюда обычное сообщение..`);
        }
        if (msg.text.slice(0, 8) == '/sendall') {
            if (admins.includes(chatId)) {// только админы могут писать всем и одному пользователю.
                sendMessageAll(msg.text.slice(8));
            }
        }
        if (msg.text.slice(0, 8) == '/sendone') {
            if (admins.includes(chatId)) {// только админы могут писать всем и одному пользователю.
                let answerOne = msg.text.split(" ")
                console.log(answerOne[0], answerOne[1]);
                sendMessage(answerOne.slice(2).join(" "), answerOne[1]);
                console.log(answerOne.slice(2).join(" "));
            }
        }
    } else {
        bot.sendMessage(chatId, `Ты написал вот это ${msg.text}`);
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

setInterval(function () {
    //40m
    fetch('https://retrieve.pskreporter.info/query?receiverCallsign=EW8MKU&frange=7000000-8000000')
    //2m
    //fetch('https://retrieve.pskreporter.info/query?receiverCallsign=EW8MKU&frange=144000000-146000000')
        //15m
        //fetch('https://retrieve.pskreporter.info/query?receiverCallsign=EW8MKU&frange=21000000-22000000')
        //10m
        //fetch('https://retrieve.pskreporter.info/query?receiverCallsign=EW8MKU&frange=28000000-29000000')
        //20m
        //fetch('https://retrieve.pskreporter.info/query?receiverCallsign=EW8MKU&frange=14000000-15000000')
        //30m
        // fetch('https://retrieve.pskreporter.info/query?receiverCallsign=EW8MKU&frange=10000000-11000000')
        .then(res => {
            res.text().then(result => {
                console.log(`prommis good fetch pskreporter`);
                let answer = result.toString().split("<").filter(item => {
                    return item.toString().includes(callsign);
                })
                answer = answer.filter(item => {
                    if (item.includes(callsign) && item.includes("receptionReport")) {
                        return true;
                    } else {
                        console.log(`не упоминался позывной в запорсе ${callsign}`);
                        return false;
                    }
                }).map(item => {
                    let parse = item.split(" ");
                    let callsignUser = parse[3].split("=")[1].slice(1, -1);
                    if (!objFullDBCurrent.hasOwnProperty(callsignUser)) {
                        objFullDBCurrent[callsignUser] = parsingCallsign(parse);
                    }
                    return parsingCallsign(parse);
                })
                // console.log(answer);
                for (const keyInCurrent in objFullDBCurrent) {
                    if (objFullDBOld[keyInCurrent] == undefined) {
                        otpavlyal = false;
                        objFullDBShow[keyInCurrent] = objFullDBCurrent[keyInCurrent];
                    }
                    if (objFullDBOld.hasOwnProperty(keyInCurrent) && objFullDBOld[keyInCurrent].flowStartSeconds != objFullDBCurrent[keyInCurrent].flowStartSeconds) {
                        otpavlyal = false;
                        objFullDBShow[keyInCurrent] = objFullDBCurrent[keyInCurrent];
                    }
                }
                let sendToBot = "";
                for (const key in objFullDBShow) {
                    sendToBot += objFullDBShow[key].inSendingToBot + "\n";
                }
                // TODO: нужно проверить чтобы сообщение не превышало лимита по длинне. выпадают ошибки
                if (otpavlyal == false && sendToBot.length > 0) {
                    otpavlyal = true;
                    sendMessageAll(startMessage + sendToBot);
                    // sendMessage(startMessage + sendToBot, users[0]);
                }
                console.log("current", objFullDBCurrent);
                // console.log("old", objFullDBOld);
                console.log("show", objFullDBShow);

                objFullDBOld = JSON.parse(JSON.stringify(objFullDBCurrent));
                objFullDBShow = {};
                objFullDBCurrent = {};
            })
        })
        .then(text => console.log(`prommis error fetch pskreporter ${text}`))
}, 300 * 1000);
//*/