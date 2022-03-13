const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Express

app.all("/", (req, res) => {
  res.send("OK");
});

app.listen(80, function(){
  console.log('Listening on: ' + 80);
});