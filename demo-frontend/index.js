const express = require('express'),
      http    = require('http'),
      app     = express(),
      port    = process.env.PORT || 3000,
      buildInfo             = require('./build_info.json'),
      butterServiceHost     = process.env.BUTTER_SERVICE_HOST || 'localhost',
      butterServiceHostPort = process.env.BUTTER_SERVICE_HOST_PORT || 8103;

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
  http.get({
      host: butterServiceHost,
      port: butterServiceHostPort,
      path: '/',
      timeout: 3000
    }, function(serviceResponse){
      var buffer = '';
      serviceResponse.on('data', function(chunk) {
        buffer += chunk;
      });
      serviceResponse.on('end', function() {
        res.setHeader('Content-Type', 'application/json');
        res.send(buffer);
      });
    }).on('error', function(err) {
      console.log('Error in GET for '+butterServiceHost+' on port '+butterServiceHostPort);
      console.log(err);
      res.send(err);
    });
});

app.listen(port, function() {
  console.log('demo-frontend listening on port ' + port);
});
