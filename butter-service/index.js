const express = require('express'),
      app     = express(),
      port    = process.env.PORT || 3000;

app.get('/healthz', function(req, res) {
  res.send('imok');
});

app.get('/', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    hasSalt: true,
    butterType: process.env.BUTTER_TYPE || 'organic' }));
});

app.listen(port, function() {
  console.log('butter-service listening on port ' + port);
});
