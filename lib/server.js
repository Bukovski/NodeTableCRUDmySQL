const { StringDecoder } = require('string_decoder'); //decoder Buffer in string UTF-8 or UTF-16
const https = require('https');
const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const {parseJsonToObject} = require('./helpers');
const config = require('./config');
const handlers = require('./handlers');


const server = {};


server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req,res);
});

const httpsOption = {
  'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

server.httpsServer = https.createServer(httpsOption, (req, res) => {
  server.unifiedServer(req,res);
});

server.unifiedServer = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname; // /home
  const trimmedPath = path.replace(/^\/+|\/+$/g, ''); // home
  const queryStringObject = parsedUrl.query;
  const method = req.method.toLowerCase(); // "get"
  const headers = req.headers;
  const decoder = new StringDecoder('utf-8');
  
  let buffer = '';
  
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  
  req.on('end', () => {
    buffer += decoder.end();
    
    let chosenHandler = (server.router[trimmedPath]) ? server.router[trimmedPath] : handlers.notFound; //path or 404
  
    // If the request is within the public directory use to the public handler instead
    chosenHandler = trimmedPath.includes('public') ? handlers.public : chosenHandler;
    
    const data = {
      'trimmedPath'      : trimmedPath,
      'queryStringObject': queryStringObject,
      'method'           : method,
      'headers'          : headers,
      'payload'          : parseJsonToObject(buffer)
    };
    
    chosenHandler(data, (statusCode, payload, contentType) => {
      
      statusCode = (typeof statusCode === 'number') ? statusCode : 200;
      contentType = (typeof contentType === 'string') ? contentType : 'json';
  
      let payloadString = '';
  
      const type = {
        'json': () => {
          res.setHeader('Content-Type', 'application/json');
          payload = typeof(payload) === 'object' ? payload : {};
          payloadString = JSON.stringify(payload);
        },
        'html': () => {
          res.setHeader('Content-Type', 'text/html');
          payloadString = typeof(payload) === 'string' ? payload : '';
        },
        'favicon': () => {
          res.setHeader('Content-Type', 'image/x-icon');
          payloadString = typeof(payload) !== 'undefined' ? payload : '';
        },
        'plain': () => {
          res.setHeader('Content-Type', 'text/plain');
          payloadString = typeof(payload) !== 'undefined' ? payload : '';
        },
        'css': () => {
          res.setHeader('Content-Type', 'text/css');
          payloadString = typeof(payload) !== 'undefined' ? payload : '';
        },
        'png': () => {
          res.setHeader('Content-Type', 'image/png');
          payloadString = typeof(payload) !== 'undefined' ? payload : '';
        },
        'jpg': () => {
          res.setHeader('Content-Type', 'image/jpeg');
          payloadString = typeof(payload) !== 'undefined' ? payload : '';
        }
      };
      
      type[contentType]();
      
      res.writeHeader(statusCode); //406
      res.end(payloadString); //{"name":"sample handler"}
  
      if (statusCode === 200) {
        console.log('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
      } else {
        console.log('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
      }
    });
  });
};


server.router = {
  "" : handlers.index,
  "home": handlers.index,
  'favicon.ico' : handlers.favicon,
  'public' : handlers.public,
  "workers" : handlers.workers,
  "404" : handlers.notFound
};


server.init = () => {
  server.httpServer.listen(config.httpPort, () => { // Start the HTTP server
    console.log('\x1b[36m%s\x1b[0m', `The HTTP server is running on port ${config.httpPort} in ${config.envName}`);
  });
  
  server.httpsServer.listen(config.httpsPort, () => { // Start the HTTPS server
    console.log('\x1b[36m%s\x1b[0m', `The HTTP server is running on port ${config.httpsPort} in ${config.envName}`);
  });
};


module.exports = server;
