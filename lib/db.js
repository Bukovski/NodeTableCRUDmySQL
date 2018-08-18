const mysql = require("mysql");
const {parseJsonToObject} = require('./helpers');
const config = require('./config');


const db = {};

const connection = () => {
  const connectionObj = mysql.createConnection(config.db_connect);
  
  connectionObj.connect((err) => { //connect to db
    if (err) return console.error('Error SQL connect:', err)
  });
  
  return connectionObj;
};

db.get = (sql, callback) => {
  const connect = connection();
  
  connect.query(sql, (err, result, fields) => {
    if (err) return callback('Error SQL query:', err);
  
    callback(null, result);
  });
  
  connect.end();
};

db.readAll = (callback) => { //+
  db.get(`SELECT * FROM workers`, (err, res) => {
    if (err) return callback(err);
  
    callback(null, res);
  });
};

db.remove = (id, callback) => {
  db.get(`DELETE FROM workers WHERE id=${ id }`, (err) => {
    if (err) return callback(err);
  });
};

db.add = (obj, callback) => { //+
  let { name, age, salary } = obj;
  
  db.get(`INSERT INTO workers (name, age, salary) VALUES ('${ name }', '${ age }', '${ salary }')`, (err) => {
    if (err) return callback('Could not create the new worker');
  })
};


db.update = (object, callback) => { //+
  const field = (typeof object === 'object' && Object.keys(object).length > 0) ? Object.keys(object)[1] : false;

  db.get(`UPDATE workers SET ${ field }='${ object[field] }' WHERE id='${ object.id }'`, (err) => {
    if (err) return callback(err);
  })
};

db.deleteMany = (idList, callback) => { //+
  db.get(`DELETE FROM workers WHERE id IN (${ idList })`, (err) => {
    if (err) return callback(err);
  });
};


module.exports = db;
