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
    })

app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.send('<html><head><style>body {text-align:center;font-family:Arial;color:white;background:#000;}</style></head><body><h1>Linkvertise Bypass API</h1><h2>Usage:</h2><p>/api?url=linkvertiseurl</p></body></html>')
})

app.use('/api', limit)

function validateUrl(url, res) {
  try {
        let myURL = new URL(url);
        bypass(myURL, res);
    } catch (e) {
      res.status(400).json({err:"Not a valid linkvertise link."})
    }
}

function bypass(url, res) {
  let path = url.pathname
  console.log(path)
  fetch('https://publisher.linkvertise.com/api/v1/redirect/link/static' + path)
        .then(r => r.json()).catch(()=>res.status(400).json({err:"Not a valid linkvertise link."}))
        .then(json => {
            o = Buffer.from(JSON.stringify({
                "timestamp": new Date().getTime(),
                "random": "6548307",
                "link_id": json.data.link.id
            }), 'utf-8').toString('base64');
            fetch('https://publisher.linkvertise.com/api/v1/redirect/link' + path + '/target?serial=' + o)
                .then(r => r.json())
                .then(json=>res.send(new URLSearchParams(new URL(json.data.target).search).get('k')))
        })
}

app.get('/api', cors(), (req, res) => {
      validateUrl(req.query.url, res)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})