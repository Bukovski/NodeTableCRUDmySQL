const server = require('./lib/server');
const terminal = require('./lib/terminal');

const app = {};

app.init = () => {
  server.init(); // Start the server
  
  setTimeout(() => terminal.init(), 100);
};

if (require.main === module) { //run file
  app.init();
}


module.exports = app;
