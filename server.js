// const VkBot = require('node-vk-bot-api')

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mqtt = require("mqtt");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// db.defaults({ organizers: [], volunteers: [] })
//   .write()

var host = process.env.URL;
var client = mqtt.connect(host, {
  port: 12243,
  username: process.env.USERNAME,
  password: process.env.PASSWORD
}); // process.env.USERNAME
var _topic,
  _message = null;

var _topic = "/home/rx";
var _message = "1";

client.subscribe("/home");
client.on("connect", function() {
  client.subscribe("presence", function(err) {
    if (!err) {
      client.publish("/home/rx", "ON");
    }
  });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const VkBot = require("node-vk-bot-api");
const bot = new VkBot(process.env.TOKEN);
const Markup = require("node-vk-bot-api/lib/markup");

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/add", function(request, response) {
  db.get(request.query.type) //(request.query.type)
    .push(request.query.id)
    .write();
  // console.log("write")

  var result = db.get(request.query.type).value();
  console.log(result);
  response.send("ok");
});

app.post("/chat", function(request, response) {
  console.log(request.body); // your JSON
  response.send(request.body); // echo the result back
  bot.sendMessage(request.body.user_id, request.body.message);
});

app.get("/beep", function(request, response) {
  // console.log(request.body);      // your JSON
  response.send("ok"); // echo the result back
  client.publish(_topic, _message);
});

app.get("/puup", function(request, response) {
  // console.log(request.body);      // your JSON
  response.send("ok"); // echo the result back
  client.publish(_topic, "2");
});

// bot.on((ctx) => {
//   ctx.reply('Hello!');
//   console.log(ctx); //230868199
// });

bot.command("Отправить оповещение организаторам", ctx => {
  ctx.reply(
    "Оповещение отправлено🎼",
    null,
    Markup.keyboard(["Отправить оповещение организаторам"])
  );
  // client.publish("/home/rx", "1")
  client.publish(_topic, "2");
});

bot.command("Отправить оповещение волонтерам ✨", ctx => {
  ctx.reply(
    "Оповещение отправлено🎼",
    null,
    Markup.keyboard(["Отправить оповещение волонтерам ✨"])
  );
  // client.publish("/home/rx", "1")
  client.publish(_topic, _message);
});

// client.on('message', function (topic, message) {
//   console.log(topic +": "+ message.toString())

//   if (message.toString == "button L"){
//     console.log(message)
//     console.log("!!!");

//   }
// })

client.on("message", function(topic, message) {
  console.log(message.toString());
  //bot.sendMessage(35713161, message.toString())
  if (message.toString() == "button L") {
    var result = db.get("volunteers").value();
    bot.sendMessage(
      result,
      "Добрый день волонтер! Вам было отправлено это оповещения с помощью платфоры Волонтеры+",
      null,
      Markup.keyboard(["Отправить оповещение организаторам"])
    );
    console.log("Отправлен запрос волонтерам");
  }

  if (message.toString() == "button R") {
    var result = db.get("organizers").value();
    bot.sendMessage(
      result,
      "Добрый день организатор! Вам было отправлено это оповещения с помощью платфоры Волонтеры+",
      null,
      Markup.keyboard(["Отправить оповещение волонтерам ✨"])
    );
    console.log("Отправлен запрос организаторам");
  }
});

bot.startPolling();

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
