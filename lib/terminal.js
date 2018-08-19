const readline = require('readline');
const events = require('events');
const os = require('os'); //<-- системная информация
const v8 = require('v8'); //<-- информация о движеке (системная)
const _db = require('./db');

class _events extends events {};
const e = new _events();

const terminal = {};


// Input handlers
//возбуждаем команды которые были вызваны в консоли из нашего массива команд
e.on('help', (str) => {
  terminal.responders.help();
});

e.on('exit', (str) => {
  terminal.responders.exit();
});

e.on('stats', (str) => {
  terminal.responders.stats();
});

e.on('workers list', (str) => {
  terminal.responders.listWorkers();
});

e.on('worker info', (str) => {
  terminal.responders.workerInfo(str);
});



// Responders object
terminal.responders = {}; //обьект с ответами на комынды в консоль

// Help / Man
terminal.responders.help = () => { //подсказки по зарегестрированным командам
  const commands = { //список подсказок по ппользованию
    'exit' : 'Kill the terminal (and the rest of the application)',
    'help' : 'Show this help page',
    'stats' : 'Get statistics on the underlying operating system and resource utilization',
    'List workers' : 'Show a list of all the workers in the data base',
    'Worker info --{workerField}:{workerValue}' : 'Show details of a specified worker'
  };
  
  //делаем красивый вывод в консоль всех команд обрамленнымими вертикальными и горизонтальными линиями (в рамку)
  terminal.horizontalLine();
  terminal.centered('CLI MANUAL'); //надпись которая будет по центру при выводе конд
  terminal.horizontalLine();
  terminal.verticalSpace(2);
  
  // Show each command, followed by its explanation, in white and yellow respectively
  for (let key in commands) {
    if (commands.hasOwnProperty(key)) {
      const value = commands[key]; //получаем ключи комнд
      let line = '      \x1b[33m '+key+'      \x1b[0m'; //красим в цвет
      const padding = 60 - line.length; //отступы слева от границы терминала
      
      for (let i = 0; i < padding; i++) {
        line += ' ';
      }
      
      line += value;
      console.log(line);
      terminal.verticalSpace();
    }
  }
  terminal.verticalSpace(1);
  
  // End with another horizontal line
  terminal.horizontalLine();
};

terminal.verticalSpace = (lines) => { //вертикальные линии
  lines = (typeof(lines) === 'number' && lines > 0) ? lines : 1;
  
  for (let i = 0; i < lines; i++) {
    console.log('');
  }
};

terminal.horizontalLine = () => { //горизонтальные линии в консоли
  const width = process.stdout.columns; // Get the available screen size
  let line = ''; // Put in enough dashes to go across the screen
  
  for (let i = 0; i < width; i++) {
    line += '-';
  }
  
  console.log(line);
};

terminal.centered = (str) => { //выставляем текст по центру
  str = (typeof(str) === 'string' && str.trim().length) ? str.trim() : '';
  
  const width = process.stdout.columns; // Get the available screen size
  
  // Calculate the left padding there should be
  const leftPadding = Math.floor((width - str.length) / 2); //текст по центру
  let line = ''; // Put in left padded spaces before the string itself
  
  for (let i = 0; i < leftPadding; i++) {
    line += ' ';
  }
  
  line += str;
  console.log(line);
};

terminal.responders.exit = () => {
  process.exit(0); //<-- завершить стрим и выйти из терминала
};

// Stats
terminal.responders.stats = () => { //<-- выводим данные о состоянии компьютера
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
    terminal.horizontalLine(); //просто красиво выводим все в консоли взято с help выеш
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

terminal.responders.listWorkers = () => { //+
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
            let line = '      \x1b[33m '+ firstUpper +'  :\x1b[0m  ' + value[key]; //красим в цвет
            const padding = 35 - line.length; //отступы слева от границы терминала
            
            for (let j = 0; j < padding; j++) {
              line += ' ';
            }
            allLine += line;
          }
        }
        
        console.log(allLine);
        // terminal.verticalSpace();
        terminal.horizontalLine();
      }
    }
  });
};

// More user info
terminal.responders.workerInfo = (str) => { //+
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
            let line = '      \x1b[33m '+ firstUpper +'  :\x1b[0m  ' + value[key]; //красим в цвет
            const padding = 35 - line.length; //отступы слева от границы терминала
        
            for (let j = 0; j < padding; j++) {
              line += ' ';
            }
            allLine += line;
          }
        }
    
        console.log(allLine);
        // terminal.verticalSpace();
        terminal.horizontalLine();
      }
    }
  });
};

// List Checks
/*terminal.responders.listChecks = () => {
  console.log(process.stdout.columns)
  console.log(process.stdout.rows)
  console.log("You asked to list checks");
};*/



terminal.processInput = (str) => { //отлов даныых котоыре ввел пользователь в консоли
  str = (typeof(str) === 'string' && str.trim().length) ? str.trim() : false;
  
  if (str) {
    const uniqueInputs = [ //список слов которые можно ввести в консоль иначе выдаст предупреждение
      'help',
      'exit',
      'stats',
      'workers list',
      'worker info'
    ];
    
    let matchFound = false; //если слово в массиве будет найдено true
    
    uniqueInputs.some((input) => { //ищем совпадения в массиве с тем что ввели в консоли
      if (str.toLowerCase().includes(input)) { //нашли совпадение
        matchFound = true; //сообщаем чтобы не выводило сообщение об ошибке в консоль
        //help some string
        //console.log(input, str); //help help some string
        e.emit(input,str); //событие пока генерируем но нигде не вызываем
        
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
  
  // Стрим output используется для вывода на экран приглашения ввода данных пользователем, которые поступают и считываются со стрима input.
  const _interface = readline.createInterface({
    input: process.stdin, //Открытый для чтения стрим для прослушивания. Эта опция являтся обязательной.
    output: process.stdout, //Открытый для записи стрим, куда записывается данные читаемой строки.
    prompt: '' //строка
  });
  
  _interface.prompt();
  
  _interface.on('line', (str) => {
    terminal.processInput(str); //передаем из консоли то что ввели
    
    _interface.prompt();
  });
  
  _interface.on('close', () => { //если пользователь закрыл терминал то убиваем стрим
    process.exit(0);
  });
};


module.exports = terminal;
