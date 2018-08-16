const fs = require('fs');
const path = require('path');

const dataFs = {};

dataFs.baseDir = path.join(__dirname, '../');

dataFs.parseJsonToObject = (str) => {
  try{
    return JSON.parse(str);
  } catch(e){
    return {};
  }
};

dataFs.settings = () => dataFs.parseJsonToObject(fs.readFileSync(dataFs.baseDir + '/.data/settings.json', 'utf8'))[0];



if(module.parent) { //елси файл подключается к другому и будет вызван
  module.exports = dataFs;
} else {
  dataFs;
}