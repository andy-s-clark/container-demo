const express = require('express'),
      request = require('request'),
      app     = express(),
      port    = process.env.PORT || 3000,
      buildInfo        = require('./build_info.json'),
      butterServiceUrl = process.env.BUTTER_SERVICE_URL || 'http://butter-service:8103/';

app.get('/healthz', function(req, res) {
  res.send('imok');
});

app.get('/infoz', function(req, res) {
  res.send(buildInfo);
});

app.get('/', function(req, res) {
  res.send('Frontend homepage');
});

app.get('/butter', function(req, res) {
  request(butterServiceUrl, function(error, serviceResponse, body) {
    if (error) {
      console.log('Error in GET for '+butterServiceUrl);
      console.log(error);
      res.send(error);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(body);
    }
  });
});

app.get('/die', function(req, res) {
  console.log('I am going to quickly die. This message may not be written.');
  process.exit(1);
});

app.listen(port, function() {
  console.log('demo-frontend listening on port ' + port);
});
