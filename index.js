require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urls = [];
let idCounter = 1;

app.post('/api/shorturl', (req, res) => {
  const orgUrl = req.body.url;
  try{
    const urlObj = new URL(orgUrl);
    if(urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(urlObj.hostname, (err) => {
      if(err){
        return res.json({ error: 'invalid url' });
      }
        const shortUrl = idCounter++; 
        urls.push({original_url: orgUrl, short_url: shortUrl});
        return res.json({ original_url: orgUrl, short_url: shortUrl });
      });
    }
  catch (error) {
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shortUrl/:shortUrl', (req, res) => {
  const id = parseInt(req.params.shortUrl);
  const urlEntry = urls.find((u) => u.short_url === id);
  if(urlEntry) {
    return res.redirect(urlEntry.original_url);
  } else {   
    return res.json({ error: 'No short URL found for the given input' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
});
