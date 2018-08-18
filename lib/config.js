var environments = {};

// Development (default) environment
environments.development = {
  'httpPort' : 3000,
  'httpsPort' : 3001,
  'envName' : 'development',
  "db_connect": {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "test"
  },
};

// Production environment
environments.production = {
  'httpPort' : 5000,
  'httpsPort' : 5001,
  'envName' : 'production',
  "db_connect": {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "test"
  },
};

const currentEnvironment = (typeof process.env.NODE_ENV === 'string') ? process.env.NODE_ENV.toLowerCase() : '';
const environmentToExport = (typeof environments[currentEnvironment] === 'object') ? environments[currentEnvironment] : environments.development; //NODE_ENV=production node index.js else development


module.exports = environmentToExport;


//node index.js
//NODE_ENV=development node index.js

//NODE_ENV=production node index.js
