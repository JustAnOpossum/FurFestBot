# Midwest FurFest Countdown Bot
This is a bot that I made, it counts down the days until MFF in the form of a picture.

# Language
The bot was coded in Node.js

# Where to find my bot?
You can find my bot at

https://telegram.me/FurFestBot

# How to run?

If you want to run it for a different convention, or whatever else. Download the repository, and run
```
npm install
sudo apt install graphicsmagick
sudo apt install mongodb
```

You need two Telegram bot API keys, one for the main bot and another for the admin bot.

Run your bot behind a https nginx reverse proxy with a path of /bot(token). If you don't know what this is [read this](https://www.nginx.com/resources/admin-guide/reverse-proxy/)

ex: /bot123abc58347589

Finally add cron.js to the crontab to send the daily picture.

If you want to run this bot on windows then you need to add graphicsmagick to your path and install mongodb.

### To setup the bot you need to edit 2 JS files and some environment variables.

* Edit src/messages.js - This file contains the messages for the bot and the owner chat ID. Edit this with what you want to change.

* Edit src/days.js - Edit the date here to change the day it counts down to.

## Environment Variables

TYPE: "production" or "test"

* production: Runs the bot in normal mode.

* test: Runs the bot in testing mode, pass a telegram bot api key for testing.

TOKEN: Telegram bot API key for normal bot.

ADMIN: Telegram bot API key for admin bot.

CON: Name for the convention ex: "MFF"

HOST: IP for the mongodb database. (Default: localhost)

PORT: Port for the mongodb database. (Default: 27017)

DBNAME: Name for the mongodb database.

WEBHOOK: URL for the webhook to your server. ex: example.com


## Admin Commands:

/logs: Shows log file.

/users: Shows how many users are on the bot.

/upload (credit): Reads zip file from /tmp

# Example Picture

![img](https://image.ibb.co/gUan7R/photo_2018_01_09_15_58_11.jpg)
