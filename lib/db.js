const mysql = require("mysql");
const {settings, parseJsonToObject} = require('./dataFs');

const db = {};

const connection = () => {
  const connectionObj = mysql.createConnection(settings().db_connect);
  
  connectionObj.connect((err) => { //подключились к БД
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

db.readAll = (callback) => {
  db.get(`SELECT * FROM workers`, (err, res) => {
    if (err) return console.error(err);
  
    callback(JSON.stringify(res));
  });
};

db.remove = (id) => {
  id = (typeof(id) === 'string' && id.length > 0) ? id : false;
  
  if (!id) return console.error('Bad data');
  
  db.get(`DELETE FROM workers WHERE id=${ id }`, (err, res) => {
    if (err) return console.error(err);
  });
};

db.add = (str) => {
  str = (typeof(str) === 'string' && str.length > 0) ? str : '{}';
  
  let {name, age, salary} = parseJsonToObject(str);
  
  name = (typeof(name) === 'string' && name.length > 0) ? name : false;
  age = (typeof(age) === 'string' && age.length > 0) ? age : false;
  salary = (typeof(salary) === 'string' && salary.length > 0) ? salary : false;
  
  if (!name || !age || !salary) return console.error('Bad data');
  
  db.get(`INSERT INTO workers (name, age, salary) VALUES ('${ name }', '${ age }', '${ salary }')`, (err) => {
    if (err) return console.error(err);
  })
};


db.update = (json) => {
  json = (typeof(json) === 'string' && json.length > 0) ? json : '{}';
  
  json = parseJsonToObject(json);
  const field = (typeof json === 'object' && Object.keys(json).length > 0) ? Object.keys(json)[1] : false;
  
  if (!field) return console.error('Bad data');
  
  db.get(`UPDATE workers SET ${ field }='${ json[field] }' WHERE id='${ json.id }'`, (err) => {
    if (err) return console.error(err);
  })
};

db.deleteMany = (json) => {
  json = (typeof(json) === 'string' && json.length > 0) ? json : '{}';
  
  let id = parseJsonToObject(json).id;
  
  id = (typeof(id) === 'string' && id.length > 0) ? id : false;
  
  if (!id) return console.error('Bad data');
  
  db.get(`DELETE FROM workers WHERE id IN (${ id })`, (err) => {
    if (err) return console.error(err);
  });
};


module.exports = db;
