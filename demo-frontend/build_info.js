const fs     = require('fs'),
      moment = require('moment'),
      dst    = './build_info.json'
      info   = {
        appName: 'demo-frontend',
        buildDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        buildNumber: process.env.BUILD_NUMBER || 0
      };
fs.writeFile(dst, JSON.stringify(info), function(err) {
  if (err) {
    console.log(err);
  }
});
