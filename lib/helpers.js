const fs = require('fs');
const path = require('path');

const helpers = {};


helpers.baseDir = path.join(__dirname, '../');

helpers.parseJsonToObject = (str) => {
  try{
    return JSON.parse(str);
  } catch(e){
    return {};
  }
};


helpers.getTemplate = (templateName, callback) => { // ('index', (err,str)) for html file
  templateName = typeof(templateName) === 'string' && templateName.length > 0 ? templateName : false;
  
  if (!templateName) return callback('A valid template name was not specified');
  
  const templatesDir = path.join(helpers.baseDir, 'public', templateName + '.html');
  
  fs.readFile(templatesDir, 'utf8', (err, str) => {
    if (err || !str.length) return callback('No template could be found');
    
    callback(false, str);
  });
};

helpers.getStaticAsset = (fileName, callback) => { //load file from folder public
  fileName = typeof(fileName) === 'string' && fileName.length > 0 ? fileName : false;
  
  if (!fileName) return callback('A valid file name was not specified');
  
  const publicDir = path.join(helpers.baseDir, 'public', fileName);
  
  fs.readFile(publicDir, (err, data) => {
    if(err || !data) return callback('No file could be found');
    
    callback(false, data);
  });
};




if (module.parent) {
  module.exports = helpers;
} else {
  helpers;
}