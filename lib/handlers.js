const path = require('path');
const _db = require('./db');
const helpers = require('./helpers');


const handlers = {};


handlers.notFound = (data,callback) => {
  callback(404);
};


handlers.index = (data, callback) => {
  if(data.method === 'get') { //проверяем метод передачи на страницу
    helpers.getTemplate('index', (err, str) => { //отдаем страниу из templates/index.html
      if (err || !str) return callback(500, undefined, 'html'); //ошибка 500
      
      callback(200, str, 'html'); //все хороше отдать страницу и код 200
    });
  } else {
    callback(404, undefined, 'html');
  }
};

handlers.favicon = (data, callback) => {
  if (data.method !== 'get') return callback(405);
  
  helpers.getStaticAsset('img/favicon.ico', (err,data) => {
    if(err || !data) return callback(500);
    
    callback(200,data,'favicon');
  });
};


handlers.public = (data, callback) => {
  if (data.method !== 'get') return callback(405);
  
  const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
  
  if (!trimmedAssetName.length) return callback(404);
  
  helpers.getStaticAsset(trimmedAssetName, (err, data) => {
    if (err || !data) return callback(404);
      
      let contentType = 'plain'; //default 'Content-Type'
      const extensionObj = {
        '.css': 'css',
        '.png': 'png',
        '.jpg': 'jpg',
        '.ico': 'favicon'
      };
      
      const requestPath = path.extname(trimmedAssetName);
      contentType = (Object.keys(extensionObj).includes(requestPath)) ? extensionObj[requestPath] : contentType;
      
      callback(200, data, contentType);
  });
};


/*
 * JSON API Handlers
 *
 */

handlers.workers = (data, callback) => {
  const acceptableMethod = ['post', 'get', 'put', 'delete'];
  
  if (!acceptableMethod.includes(data.method)) return callback(405);
  
  handlers._workers[data.method](data, callback); //get, data, callback
};


handlers._workers = {};


handlers._workers.get = (data, callback) => {
  _db.readAll((err, json) => {
    if (err || !json) return callback(404, {'Error': 'Can\'t get the data'});
  
    callback(200, json);
  })
};


handlers._workers.post = (data, callback) => {
  const name = (typeof (data.payload.name) === 'string') && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  const age = (typeof (data.payload.age) === 'string' && data.payload.age.trim().length < 3) ? data.payload.age.trim() : false;
  const salary = (typeof (data.payload.salary) === 'string' && data.payload.salary.trim().length < 7) ? data.payload.salary.trim() : false;
  
  if(!name || !age || !salary) return callback(400,{'Error' : 'Missing required fields'});
  
  const workerObject = {
    "name": name,
    "age": age,
    "salary": salary
  };
  
  _db.add(workerObject, (err) => {
    if (err) return callback(500, {'Error': err});
    
    callback(200);
  })
};


handlers._workers.put = (data, callback) => {
  const objectLength = (Object.keys(data.payload).length === 2);
  const id = (typeof (data.payload.id) === 'string' && !isNaN(data.payload.id)) ? data.payload.id.trim() : false;
  const secondParam = (typeof Object.keys(data.payload)[1] === 'string' && Object.keys(data.payload)[1].trim().length) ? Object.keys(data.payload)[1].trim() : false;
  const secondValue = (typeof data.payload[Object.keys(data.payload)[1]] === 'string' && data.payload[Object.keys(data.payload)[1]].trim().length) ? data.payload[Object.keys(data.payload)[1]].trim() : false;
  
  if (!objectLength || !id || !secondParam || !secondValue) return callback(400, {'Error' : 'Missing fields to update.'});
  
  const workerObject = {
    "id": id,
    [secondParam]: secondValue
  };
  
  _db.update(workerObject, (err) => {
    if (err) return callback(500, {'Error' : 'Could not update the user.'});
  
    callback(200);
  })
};


handlers._workers.delete = (data, callback) => {
  
  if (data. queryStringObject.id) {
    const removeOneWorker = (typeof data. queryStringObject.id === 'string' && !isNaN(data. queryStringObject.id)) ? data. queryStringObject.id.trim() : false;
    
    if (!removeOneWorker) return callback(400, {'Error' : 'Missing required field'});
    
    _db.remove(removeOneWorker, (err) => {
      if (err) return callback(500, {'Error' : 'Could not delete the specified worker'});
  
      callback(200);
    });
   
  } else {
    const idList = (typeof (data.payload.id) === 'string' && data.payload.id.split(',').every(elem => !isNaN(elem))) ? data.payload.id.trim() : false;
  
    if (!idList) return callback(400, {'Error': 'Missing selected field'});
  
    _db.deleteMany(idList, (err) => {
      if (err) return callback(500, {'Error': 'Could not remove selected workers'});
    
      callback(200);
    })
  }
};








module.exports = handlers;
