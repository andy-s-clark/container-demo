var express = require('express'),
    app     = express(),
    port    = process.env.PORT || 3000;

app.get('/healthz', function(req, res) {
  res.send('imok');
});

app.get('/', function(req, res) {
  res.send('Frontend homepage');
});

app.get('/butter', function(req, res) {
  res.send('Frontend butter page');
});

app.listen(port, function() {
  console.log('demo-frontend listening on port ' + port);
});
