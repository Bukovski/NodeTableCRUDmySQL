const readline = require('readline');
const events = require('events');
const os = require('os');
const v8 = require('v8');
const _db = require('./db');

class _events extends events {};
const e = new _events();

const terminal = {};


e.on('help', () => {
  terminal.responders.help();
});

e.on('exit', () => {
  terminal.responders.exit();
});

e.on('stats', () => {
  terminal.responders.stats();
});

e.on('workers list', () => {
  terminal.responders.listWorkers();
});

e.on('worker info', (str) => {
  terminal.responders.workerInfo(str);
});


terminal.responders = {};


terminal.responders.help = () => {
  const commands = { //helper list object
    'exit' : 'Kill the terminal (and the rest of the application)',
    'help' : 'Show this help page',
    'stats' : 'Get statistics on the underlying operating system and resource utilization',
    'workers list' : 'Show a list of all the workers in the data base',
    'worker info --{workerField}:{workerValue}' : 'Show details of a specified worker'
  };
  
  //beautiful design
  terminal.horizontalLine();
  terminal.centered('TERMINAL MANUAL'); //the label will be at the center when output
  terminal.horizontalLine();
  terminal.verticalSpace(2);
  
  // Show each command, followed by its explanation, in white and yellow respectively
  for (let key in commands) {
    if (commands.hasOwnProperty(key)) {
      const value = commands[key];
      let line = '      \x1b[33m ' + key + '      \x1b[0m'; //to change the color word
      const padding = 60 - line.length; //padding to the right of the words
      
      for (let i = 0; i < padding; i++) {
        line += ' ';
      }
      
      line += value;
      console.log(line);
      terminal.verticalSpace();
    }
  }
  terminal.verticalSpace(1);
  
  terminal.horizontalLine(); //End with another horizontal line
};

terminal.verticalSpace = (lines) => {
  lines = (typeof(lines) === 'number' && lines > 0) ? lines : 1;
  
  for (let i = 0; i < lines; i++) {
    console.log('');
  }
};

terminal.horizontalLine = () => {
  const width = process.stdout.columns; // Get the available screen size
  let line = ''; // Put in enough dashes to go across the screen
  
  for (let i = 0; i < width; i++) {
    line += '-';
  }
  
  console.log(line);
};

terminal.centered = (str) => { //put the text on center
  str = (typeof(str) === 'string' && str.trim().length) ? str.trim() : '';
  
  const width = process.stdout.columns; // Get the available screen size
  
  // Calculate the left padding there should be
  const leftPadding = Math.floor((width - str.length) / 2);
  let line = ''; // Put in left padded spaces before the string itself
  
  for (let i = 0; i < leftPadding; i++) {
    line += ' ';
  }
  
  line += str;
  console.log(line);
};

terminal.responders.exit = () => {
  process.exit(0); //complete the stream and exit the terminal
};


terminal.responders.stats = () => { //data on the status of the computer
    const stats = {
      'Load Average' : os.loadavg().join(' '),
      'CPU Count' : os.cpus().length,
      'Free Memory' : os.freemem(),
      'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
      'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
      'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
      'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
      'Uptime' : os.uptime()+' Seconds'
    };
    
    // Create a header for the stats
    terminal.horizontalLine();
    terminal.centered('SYSTEM STATISTICS');
    terminal.horizontalLine();
    terminal.verticalSpace(2);
    
    // Log out each stat
    for (let key in stats) {
      if (stats.hasOwnProperty(key)) {
        const value = stats[key];
        let line = '      \x1b[33m '+key+'      \x1b[0m';
        const padding = 60 - line.length;
        
        for (let i = 0; i < padding; i++) {
          line += ' ';
        }
        
        line += value;
        console.log(line);
        terminal.verticalSpace();
      }
    }
    
    terminal.verticalSpace();
    terminal.horizontalLine();
};

terminal.responders.listWorkers = () => {
  _db.readAll((err, res) => {
    if (err) return console.log('Missing required fields');
    
    terminal.horizontalLine();
    terminal.centered('LIST WORKERS');
    terminal.horizontalLine();
    terminal.verticalSpace(2);
    terminal.horizontalLine();
  
    for (let obj in res) {
      if (res.hasOwnProperty(obj)) {
        const value = res[obj]; //{ id: 7, name: 'Иванов', age: 27, salary: 500 }
        let allLine = '';
        
        for (let key in value) {
          if (value.hasOwnProperty(key)) {
    
            const firstUpper = key[0].toUpperCase() + key.slice(1);
            let line = '      \x1b[33m '+ firstUpper +'  :\x1b[0m  ' + value[key];
            const padding = 35 - line.length;
            
            for (let j = 0; j < padding; j++) {
              line += ' ';
            }
            allLine += line;
          }
        }
        
        console.log(allLine);
        terminal.horizontalLine();
      }
    }
  });
};


terminal.responders.workerInfo = (str) => {
  try {
    var [, field, value] = str.match(/--\s?(\w*)[\s]*:[\s]*([[а-яё\w]*)/i);
  } catch (e) {
    return console.error('Not correct data, use the "help" command');
  }
  
  field = (typeof field === 'string' && field.trim().length && isNaN(field)) ? field.trim() : false;
  value = (typeof value === 'string' && value.trim().length) ? value.trim() : false;
  
  if (!field || !value) return console.error('Not correct data, use the "help" command');
  
  _db.get(`SELECT * FROM workers WHERE ${ field } = '${ value }'`, (err, res) => {
    if (err) return console.error('Missing required fields');

    terminal.horizontalLine();
    terminal.centered('WORKER INFO');
    terminal.horizontalLine();
    terminal.verticalSpace(2);
    terminal.horizontalLine();

    for (let obj in res) {
      if (res.hasOwnProperty(obj)) {
        const value = res[obj]; //{ id: 7, name: 'Иванов', age: 27, salary: 500 }
        let allLine = '';
    
        for (let key in value) {
          if (value.hasOwnProperty(key)) {
        
            const firstUpper = key[0].toUpperCase() + key.slice(1);
            let line = '      \x1b[33m '+ firstUpper +'  :\x1b[0m  ' + value[key];
            const padding = 35 - line.length;
        
            for (let j = 0; j < padding; j++) {
              line += ' ';
            }
            allLine += line;
          }
        }
    
        console.log(allLine);
        terminal.horizontalLine();
      }
    }
  });
};


terminal.processInput = (str) => { //capture data entered by the user in the console
  str = (typeof(str) === 'string' && str.trim().length) ? str.trim() : false;
  
  if (str) {
    const uniqueInputs = [ //command list
      'help',
      'exit',
      'stats',
      'workers list',
      'worker info'
    ];
    
    let matchFound = false; //if words to be find = true
    
    uniqueInputs.some((input) => {
      if (str.toLowerCase().includes(input)) {
        matchFound = true;
        
        e.emit(input,str);
        
        return true;
      }
    });
    
    if (!matchFound) {
      console.log("Sorry, try again");
    }
  }
};


terminal.init = () => {
  console.log('\x1b[34m%s\x1b[0m','The terminal is running');
  
  const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  });
  
  _interface.prompt();
  
  _interface.on('line', (str) => {
    terminal.processInput(str);
    
    _interface.prompt();
  });
  
  _interface.on('close', () => { //if the user closed the terminal then kill the stream
    process.exit(0);
  });
};


module.exports = terminal;

// console.log(process.stdout.columns)
// console.log(process.stdout.rows)
