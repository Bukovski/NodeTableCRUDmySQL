const app = {};


app.doc = document;
app.table = app.doc.getElementById('workersTable').children[1];
app.allWorkers = '';

app.table.oldHTML = app.table.innerHTML; //save the layout table at the start



app.request = (method, url, json, callback) => {
  method = (typeof(method) === 'string' && ['POST','GET','PUT','DELETE'].includes(method.toUpperCase())) ? method.toUpperCase() : 'GET';
  url = (typeof(url) === 'string') ? url : '/';
  json = (typeof(json) === 'object' && json !== null) ? json : {};
  
  const xhr = new XMLHttpRequest();
  
  xhr.open(method, url, true); //async-true
  xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
  
  xhr.onload = () => {
    if (xhr.status !== 200) return callback(xhr.status + ': ' + xhr.statusText); //404: Not Found
  
    callback(null, xhr.responseText);
  };
  
  xhr.onerror = xhr.onabort = () => {
    setTimeout(app.request(method, url, json, callback), 500);
  };
  
  xhr.send(JSON.stringify(json));
};


app.template = (arr) => {
  arr.forEach((elem => {
    app.table.innerHTML += `
      <tr>
        <td>${ elem.id }</td>
        <td>${ elem.name }</td>
        <td>${ elem.age }</td>
        <td>${ elem.salary }</td>
        <td><input type='checkbox' class="checkWorkers" value="${ elem.id }"></td>
        <td><a href="${ elem.id }">Delete</a></td>
      </tr>
    `;
  }))
};


app.writeTable = () => app.request('GET', '/api/get', '', (err, data) => {
  if (err) return console.error(err);
  
  app.table.innerHTML = app.table.oldHTML; //purify the fields of the table
  
  app.allWorkers = JSON.parse(data);
  
  return app.template(app.allWorkers);
});


app.deleteWorker = () => app.table.addEventListener('click', (event) => {
  const target = event.target;
  
  if (target.tagName === 'A') {
    event.preventDefault();
    
    const parentDelete = target.parentNode.parentNode;
    parentDelete.parentNode.removeChild(parentDelete);
    
    app.request('GET', '/api/delete?id=' + target.pathname.slice(1));
  }
});


app.createWorker = () => app.doc.getElementById('sendNewWorker').addEventListener('click', function(event) {
  event.preventDefault();
  
  const form = this.parentNode;
  const jsonInput = {
    name: form.elements.name.value,
    age: form.elements.age.value,
    salary: form.elements.salary.value
  };
  
  if (jsonInput.name && jsonInput.age && jsonInput.salary) {
    app.request('POST', '/api/add', jsonInput);
  
    form.elements.name.value   = '';
    form.elements.age.value    = '';
    form.elements.salary.value = '';

    return app.writeTable();
  }
  return false;
});


app.updateWorker = () => app.table.addEventListener('dblclick', (event) => {
  const target = event.target;
  const trArr = [];
  target.parentNode.innerHTML.replace(/<td>(.*)<\/td>/ig, (tag, item) => trArr.push(item));
  
  if (target.tagName === 'TD' && !trArr[0].includes(target.innerHTML) && !trArr[4].includes(target.innerHTML)  && !trArr[5].includes(target.innerHTML)) {
    target.innerHTML = (isNaN(+target.innerHTML))
      ? `<input type="text" value="${target.innerHTML}" id="focusId" onkeypress="saveData(event)" onBlur="inputBlur(event)">`
      : `<input type="number" value="${target.innerHTML}" id="focusId" onkeypress="saveData(event)" onBlur="inputBlur(event)">`;
  
    app.doc.getElementById('focusId').focus();
  }
});

function saveData(event) {
  if(event.keyCode === 13){
    event.preventDefault();
    
    app.doc.getElementById('focusId').blur();
  }
}

function inputBlur(event) {
  const target = event.target;
  
  if (target.value !== target.defaultValue) {
    app.saveUpdate(target.parentNode.parentNode, target.value);
  }
  
  target.parentNode.innerHTML = target.value;
}


app.saveUpdate = (field, str) => {
  field = (typeof field === 'object' && field !== null) ? field : false;
  str = (typeof str === 'string' && str.length > 0) ? str : false;
  
  if (field && str) {
    const trArr = [];
    const arrFields = ['id', 'name', 'age', 'salary'];
  
    field.innerHTML.replace(/<td>(.*)<\/td>/ig, (tag, item) => trArr.push(item));
  
    trArr.forEach((elem, index) => {
      if (elem.includes('input')) {
        field = (arrFields[index])
      }
    });
  
    app.request('POST', '/api/update', {id: trArr[0], [field]: str});
  }
};


app.liveSearch = () => app.doc.getElementById('search').addEventListener('keyup', (event) => {
  app.table.innerHTML = app.table.oldHTML; //purify the fields of the table
  
  const filterObj = (arr, searchKey) => {
    const lowerStr = (str) => str.toString().toLowerCase();
    searchKey = lowerStr(searchKey);
    
    return arr.filter((obj) => Object.keys(obj).some((key) => lowerStr(obj[key]).includes(searchKey)));
  };
  
  return app.template(filterObj(app.allWorkers, event.target.value));
});


app.deleteMany = () => app.doc.getElementById('deleteCheckWorker').addEventListener('click', function (event) {
  event.preventDefault();
  
  const allCheckbox = app.doc.getElementsByClassName('checkWorkers');
  const arrValue = [...allCheckbox].reduce((arr, elem) => (elem.checked) ? [...arr, elem.value] : arr, []);
  
  if (arrValue.length) {
    const idWorkersToString = arrValue.join(',');
  
    app.request('POST', '/api/deleteMany', {id: idWorkersToString});
  
    return app.writeTable();
  }
  
  return false;
});


app.init = () => {
  app.writeTable();
  
  app.deleteWorker();
  
  app.createWorker();
  
  app.updateWorker();
  
  app.liveSearch();
  
  app.deleteMany();
};

window.onload = () => app.init();
