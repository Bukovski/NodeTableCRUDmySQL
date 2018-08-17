const http = require('http');
const url = require('url');
const {settings} = require('./dataFs');
const db = require('./db');


const fs = require('fs');
const paths = require('path');


const config = settings().server;

const server = {};

server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req,res);
});

server.unifiedServer = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname; // /home
  const trimmedPath = path.replace(/^\/+|\/+$/g, ''); // home
  const method = req.method.toLowerCase(); // "get"
  
  const mimeTypes = { //форматы файлов для загрузки на сайт mime
    '.js'  : 'text/javascript',
    '.html': 'text/html',
    '.css' : 'text/css',
    '.jpg' : 'image/jpeg',
    '.gif' : 'image/gif',
    '.png' : 'image/png'
  };
  const extname = paths.extname(parsedUrl.path);
  
  if(path === '/home' || path === '/') { // получить данные из адресной строки браузера
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream('public/index.html', 'utf8').pipe(res);
    
  } else if(method === 'get' && path === '/api/get') {
    db.readAll((dataSQL) => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(dataSQL);
    })
    
  } else if(method === 'get' && path === '/api/delete') {
    db.remove(parsedUrl.query.id);
    
  } else if(method === 'post' && path === '/api/add') {
    req.setEncoding('utf-8');
    
    req.on('data', function(data) {
      db.add(data)
    })
    
  } else if(method === 'post' && path === '/api/update') {
    req.setEncoding('utf-8');
    
    req.on('data', function(data) {
      db.update(data)
    })
    
  } else if(method === 'post' && path === '/api/deleteMany') {
    req.setEncoding('utf-8');
    
    req.on('data', function(data) {
      db.deleteMany(data)
    })
    
  } else if(typeof mimeTypes[extname] !== 'undefined') {
    if((extname === '.gif') || (extname === '.jpg') || (extname === '.png')) { //если картинка
      const img = fs.readFileSync('./public/' + trimmedPath);
      
      res.writeHead(200, {'Content-type': mimeTypes[extname]});
      res.end(img, 'binary');
      
    } else {
      fs.readFile('./public/' + trimmedPath, 'utf8', function (err, data) { //загрузка других файлов
        if(err) {
          console.log('Could not lind or open '+ trimmedPath + ' for reading\n' );
        } else {
          res.writeHead( 200, {'Content-Type': mimeTypes[extname]});
          res.end(data);
        }
      })
    }
  } else {
    res.writeHead(404, {'Content-Type': 'text/html'});
    fs.createReadStream('public/404.html', 'utf8').pipe(res);
  }
};


server.init = () => {
  server.httpServer.listen(config.httpPort, () => { // Start the HTTP server
    console.log('\x1b[36m%s\x1b[0m','The HTTP server is running on port ' + config.httpPort);
  });
};


module.exports = server;
