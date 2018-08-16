const table = document.getElementById('workersTable').children[1];
let allWorkers;

table.oldHTML = table.innerHTML; //сохраняем шапку таблицы и в целом верстку при старте



const request = (method, url, callback) => {
  const xhr = new XMLHttpRequest();
  
  xhr.open(method, url, true); //async-true
  
  xhr.onload = () => {
    if (xhr.status !== 200) return callback(xhr.status + ': ' + xhr.statusText); //404: Not Found
  
    callback(null, xhr.responseText);
  };
  
  xhr.onerror = xhr.onabort = () => {
    setTimeout(request(method, url, callback), 500);
  };
  
  xhr.send('');
};

const writeTable = () => request('GET', '/api/get', (err, data) => {
  if (err) return console.error(err);

  table.innerHTML = table.oldHTML; //очищаем таблицу до стартового состояния
  
  allWorkers = JSON.parse(data);
  return allWorkers.forEach((elem => {
    table.innerHTML += `
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
});

writeTable();


table.addEventListener('click', (event) => {
  const target = event.target;
  
  if (target.tagName === 'A') {
    event.preventDefault();
    
    const parentDelete = target.parentNode.parentNode;
    parentDelete.parentNode.removeChild(parentDelete);
    
    request('GET', '/api/delete?id=' + target.pathname.slice(1));
  }
});

document.getElementById('sendNewWorker').addEventListener('click', function(event) {
  event.preventDefault();
  
  const form = this.parentNode;
  const jsonInput = {
    name: form.elements.name.value,
    age: form.elements.age.value,
    salary: form.elements.salary.value
  };
  
  if (jsonInput.name && jsonInput.age && jsonInput.salary) {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/add", true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');

    xhr.send(JSON.stringify(jsonInput));
  
    form.elements.name.value   = '';
    form.elements.age.value    = '';
    form.elements.salary.value = '';

    return writeTable();
  }
  return false;
});


table.addEventListener('dblclick', (event) => {
  const target = event.target;
  const trArr = [];
  target.parentNode.innerHTML.replace(/<td>(.*)<\/td>/ig, (tag, item) => trArr.push(item));
  
  if (target.tagName === 'TD' && !trArr[0].includes(target.innerHTML) && !trArr[4].includes(target.innerHTML)  && !trArr[5].includes(target.innerHTML)) {
    target.innerHTML = (isNaN(+target.innerHTML))
      ? `<input type="text" value="${target.innerHTML}" id="focusId" onkeypress="saveData(event)" onBlur="inputBlur(event)">`
      : `<input type="number" value="${target.innerHTML}" id="focusId" onkeypress="saveData(event)" onBlur="inputBlur(event)">`;
    
    document.getElementById('focusId').focus();
  }
});

function saveData(event) {
  if(event.keyCode === 13){
    event.preventDefault();
    
    const target = event.target;

    document.getElementById('focusId').blur();
  }
}

function saveUpdate(field, str) {
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

    
    const xhr = new XMLHttpRequest();
  
    xhr.open("POST", "/api/update", true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
  
    xhr.send(JSON.stringify({
      id: trArr[0],
      [field]: str
    }));
  }
}

function inputBlur(event) {
  const target = event.target;
  
  if (target.value !== target.defaultValue) {
    saveUpdate(target.parentNode.parentNode, target.value);
  }
  
  target.parentNode.innerHTML = target.value;
}

document.getElementById('search').addEventListener('keyup', (event) => { //живой поиск
  table.innerHTML = table.oldHTML; //очищаем таблицу до стартового состояния
  
  function filterObj(arr, searchKey) {
    const lowerStr = (str) => str.toString().toLowerCase();
    searchKey = lowerStr(searchKey);
    
    return arr.filter((obj) => Object.keys(obj).some((key) => lowerStr(obj[key]).includes(searchKey)));
  }
  
  filterObj(allWorkers, event.target.value).forEach((elem => {
    table.innerHTML += `
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
});

document.getElementById('deleteCheckWorker').addEventListener('click', function (event) {
  event.preventDefault();
  
  const allCheckbox = document.getElementsByClassName('checkWorkers');
  const arrValue = [...allCheckbox].reduce((arr, elem) => (elem.checked) ? [...arr, elem.value] : arr, []);
  
  if (arrValue.length) {
    const idWorkersToString = arrValue.join(',');
  
    const xhr = new XMLHttpRequest();
  
    xhr.open("POST", "/api/deleteMany", true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
  
    xhr.send(JSON.stringify({
      id: idWorkersToString
    }));
  
    return writeTable();
  }
  
  return false;
});
