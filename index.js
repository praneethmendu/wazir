const request = require("request");
const fs = require("fs");
const Telegraf = require("telegraf");
const bot = new Telegraf("1021607689:AAGz3BxstHg3uHCZ540XdZxwakS9WRtIjKA");

/*
bot.hears("Pullout", ctx => (pullout = true));
bot.hears("Step", ctx => (step = true));
bot.hears("Up", ctx => tele(yup));
bot.hears("Bids", ctx => tele(JSON.stringify(bidsTele, null, 2)));
bot.hears("Asks", ctx => tele(JSON.stringify(asksTele, null, 2)));
bot.hears("Fat", ctx => (showFat = !showFat));
*/
let threshold = 82;

let today = { day: "", high: 0, low: 200, current: 0 };

setInterval(() => {
  var options = {
    method: "GET",
    url:
      "https://x.wazirx.com/wazirx-falcon/api/v1.0/p2p/order-book?market=usdtinr&limit=10",
    headers: {
      authority: "x.wazirx.com",
      "sec-fetch-dest": "empty",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
      accept: "*/*",
      origin: "https://wazirx.com",
      "sec-fetch-site": "same-site",
      "sec-fetch-mode": "cors",
      referer: "https://wazirx.com/p2p/USDT-INR",
      "accept-language":
        "en-US,en;q=0.9,ar;q=0.8,zh;q=0.7,gu;q=0.6,hi;q=0.5,ja;q=0.4,te;q=0.3,ur;q=0.2"
    }
  };
  request(options, function(error, response) {
    if (error) throw new Error(error);

    cur = JSON.parse(response.body).asks[0][0];
    curDateObj = new Date();
    curDay = `${curDateObj.getDate()}-${curDateObj.getMonth() +
      1}-${curDateObj.getYear()}`;

    if (today.day != curDay) today.day = curDay;
    if (cur > today.high) today.high = cur;
    if (cur < today.low) today.low = cur;
    today.current = cur;

    try {
      fs.appendFileSync(
        `data/${curDay}.csv`,
        `${curDateObj.getHours()} - ${curDateObj.getMinutes()}, ${cur}\n`
      );
    } catch (error) {
      fs.writeFileSync(
        `data/${curDay}.csv`,
        `${curDateObj.getHours()} - ${curDateObj.getMinutes()}, ${cur}\n`
      );
    }

    if (cur > threshold)
      request.post(
        {
          url:
            "https://api.telegram.org/bot1021607689:AAGz3BxstHg3uHCZ540XdZxwakS9WRtIjKA/sendMessage",
          form: {
            chat_id: "939539617",
            text: JSON.stringify(today, null, 3)
          }
        },
        function(err, httpResponse, body) {
          /* */
        }
      );
  });
}, 600 * 1000);

bot.on("text", ctx => {
  if (!isNaN(ctx.message.text)) threshold = ctx.message.text;
  return ctx.reply(`yoo\n${JSON.stringify(today, null, 3)}`);
});
bot.launch();
