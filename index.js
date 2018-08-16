const server = require('./lib/server');

const app = {};

app.init = () => {
  server.init(); // Start the server
};

if (require.main === module) { //run file
  app.init();
}


module.exports = app;
