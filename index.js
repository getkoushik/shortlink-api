const express = require('express')
  , http = require('http')
  , app = express()
  , server = http.createServer(app)
  , port = 3840
  , fetch = require('node-fetch')
  , ratelimit = require('express-rate-limit') 
  , cors = require('cors')
  , limit = ratelimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: "This ip has sent too many requests."
    }),
    ipLoggers = [
        "viral.over-blog.com",
        "gyazo.in",
        "ps3cfw.com",
        "urlz.fr",
        "webpanel.space",
        "steamcommumity.com",
        "imgur.com.de",
        "fuglekos.com",
        "grabify.link",
        "leancoding.co",
        "stopify.co",
        "freegiftcards.co",
        "joinmy.site",
        "curiouscat.club",
        "catsnthings.fun",
        "catsnthings.com",
        "xn--yutube-iqc.com",
        "gyazo.nl",
        "yip.su",
        "iplogger.com",
        "iplogger.org",
        "iplogger.ru",
        "2no.co",
        "02ip.ru",
        "iplis.ru",
        "iplo.ru",
        "ezstat.ru",
        "whatstheirip.com",
        "hondachat.com",
        "bvog.com",
        "youramonkey.com",
        "pronosparadise.com",
        "freebooter.pro",
        "blasze.com",
        "blasze.tk",
        "ipgrab.org",
        "gyazos.com",
        "discord.kim"
    ];

app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.send('<html><head><style>body {text-align:center;font-family:Arial;color:white;background:#000;}</style></head><body><h1>Shortlink Revealer API</h1><h2>Usage:</h2><p>https://api.kashooting.tech/api?url=linkvertiseurl</p><br><br><a href="https://github.com/respecting/shortlink-api">Fork me on Github!</a></body></html>')
})

app.use('/api', limit)

function validateUrl(url, res) {
  try {
        let myURL = new URL(url);
        if(ipLoggers.includes(myURL.host)) return res.status(403).json({success: false, err:"IP Logger detected."});
        bypass(myURL, res);
    } catch (e) {
      res.status(400).json({success: false, err:"Not a valid link."})
    }
}

async function bypass(url, response) {
    try {
        let resp = await fetch(url.href)
        let html = await resp.text()
        if(html.includes('<title>Loading... | Linkvertise</title>')) linkvertise(url, response); else response.json({success: true, url: resp.url, originalUrl: url.href});
    } catch {
        response.status(400).json({success: false, err:"Not a valid link."})
    }
}

function linkvertise(url, res) {
    let path = url.pathname
    fetch('https://publisher.linkvertise.com/api/v1/redirect/link/static' + path)
        .then(r => r.json()).catch(()=>res.status(400).json({success: false, err:"Not a valid linkvertise link."}))
        .then(json => {
            o = Buffer.from(JSON.stringify({
                "timestamp": new Date().getTime(),
                "random": "6548307",
                "link_id": json.data.link.id
            }), 'utf-8').toString('base64');
            fetch('https://publisher.linkvertise.com/api/v1/redirect/link' + path + '/target?serial=' + o)
                .then(r => r.json())
                .then(json=>res.json({success: true, url: new URLSearchParams(new URL(json.data.target).search).get('k'), originalUrl: url.href}))
        })
}

app.get('/api', cors(), (req, res) => {
      validateUrl(req.query.url, res)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})