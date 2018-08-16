const db = require('./lib/db');
const server = require('./lib/server');


/*(async () => {
  const objConnection = await db.connection()
  try {
    const result = await db.query(objConnection, `SELECT * FROM workers`);
    // console.log(JSON.stringify(result));
    console.log(result);
  } finally {                                          //очистка, закрываем соединение с БД!
    objConnection.end();
  }
})().catch(e => console.error(e));*/

const app = {};

app.init = () => {
  
  // Start the server
  server.init();
  
  
};

if (require.main === module) { //run file
  app.init();
}


module.exports = app;
