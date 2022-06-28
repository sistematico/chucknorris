import express from 'express'
import { Bot, webhookCallback } from 'grammy'
import * as dotenv from 'dotenv'
import * as youtubedlexec from 'yt-dlp-exec'
import fs from 'fs'
import https from 'https'
dotenv.config()

async function download(url: string, filename: string) {
  const file = fs.createWriteStream(filename)

  https.get(url, async function (response) {
    response.pipe(file)
    console.log('downloading started')

    response.on('error', (err) => {
      console.log('some error occurred while downloading')
      throw err
    })

    response.on('end', () => {
      console.log('it worked, download completed')
    })
  })
}

// const info = (url: string) => {
//   return youtubedl(url, {
//     dumpSingleJson: true,
//     noWarnings: true,
//     noCheckCertificate: true,
//     youtubeSkipDashManifest: true,
//     referer: url,
//   })
//   // .then(output => output.url)
//   // .catch(error => error)
// }

const info = async (url: string) => {
  const data = await youtubedl(url, {
    dumpSingleJson: true,
    noWarnings: true,
    noCheckCertificate: true,
    youtubeSkipDashManifest: true,
    referer: url,
  })
  .then(output => JSON.parse(output))
  // .catch(error => error)

  const json = JSON.parse(data)
  console.log("TypeOf: " + typeof json)
  // console.log("RAW: " + data)
  // console.log("Stringify: " + JSON.stringify(data))

  return json
}

if (String(process.env.BOT_TOKEN) == null) throw Error('BOT_TOKEN is missing.')

const { create: createYoutubeDl } = youtubedlexec
const ytdlpath = '/usr/local/bin/yt-dlp'
const youtubedl = createYoutubeDl(ytdlpath)

const TOKEN = String(process.env.BOT_TOKEN)
const URL = String(process.env.BOT_URL)
const REGEX = '/[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/i'
const bot = new Bot(TOKEN)
const urlRegex = /(https?:\/\/[^\s]+)/g
// const urlRegex2 = '/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig'

// bot.command('start', (ctx) => ctx.reply(JSON.stringify(youtdl)))

// async function download() {
//     const res = await nodefetch('https://assets-cdn.github.com/images/modules/logos_page/Octocat.png');
//     const buffer = await res.buffer();

//     filesystem.writeFile(`./videos/name.mp4`, buffer, () => console.log('finished downloading video!'));

//   }

// const response = await nodefetch(yourUrl);
//   const buffer = await response.buffer();

bot.command('start', (ctx) => {
  const url = 'https://www.youtube.com/watch?v=WU7zZ37XFmw'
  // info(url).then(data => ctx.reply(String(data.url)))
  info(url)

  // download('https://octodex.github.com/images/yogitocat.png', 'octo.png')

  //   youtubedl('https://www.youtube.com/watch?v=WU7zZ37XFmw', {
  //     dumpSingleJson: true,
  //     noWarnings: true,
  //     noCheckCertificate: true,
  //     youtubeSkipDashManifest: true,
  //     referer: 'https://www.youtube.com/watch?v=WU7zZ37XFmw',
  //   })
  //     .then((output) => output.url)
  //     .then((data) => {
  //       ctx.reply(String(data))
  //     })
  //     .catch((error) => ctx.reply(String(error)))
})

bot.on('message::url', (ctx) => {
  const message = String(ctx.message.text)
  // const url = message.match(urlRegex)

  ctx.reply('URL: ' + message.match(urlRegex))
})

if (String(process.env.BOT_MODE) === 'polling') {
  bot.start()
} else {
  const app = express()
  app.use(express.json())
  app.use(`/${TOKEN}`, webhookCallback(bot, 'express'))

  app.listen(Number(process.env.BOT_PORT), async () => {
    await bot.api.setWebhook(`${URL}/${TOKEN}`)
  })
}
