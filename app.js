const express = require('express');
const app = express();
const fs = require ('fs');
const envelopes = JSON.parse(fs.readFileSync('./data/envelopes.json'));

app.get ('/api/v1/envelopes', (req, res) => {
  res.send(`success`)
})



const PORT = 3000
app.listen (PORT, () => {
  console.log(`Listening to server ${PORT}`)
})