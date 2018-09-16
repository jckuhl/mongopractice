const get = async (url, params={})=> (await fetch(url, params)).json();
const ajax = (url, params={})=> fetch(url, params);

function constructList(object, ul) {
    const li = document.createElement('li');
    for(let prop in object) {
        if(object.hasOwnProperty(prop) && prop !== '_id') {
            li.innerHTML += object[prop] + ' ';
        }
    }
    li.innerHTML.trim();
    ul.appendChild(li);
}

document.getElementById('get-general').addEventListener('click', (event)=> {
    event.preventDefault();

    const ul = document.getElementById('ul');

    fetch('http://localhost:3000/generals')
        .then(data=> data.json())
        .then(json=> {
            ul.innerHTML = '';
            json.forEach(general=> constructList(general, ul))
        })
        .catch(error=> console.error(error));
});

document.getElementById('submit').addEventListener('click', event => {
    event.preventDefault();

    const general = {
        name: document.getElementById('name').value,
        side: document.getElementById('side').value
    }

    ajax('http://localhost:3000/generals', {
        method: 'POST',
        body: JSON.stringify(general),
        headers: {
            'Content-Type': 'application/json'
        }
    });
});

document.getElementById('search').addEventListener('click', event => {
    event.preventDefault();

    const name = document.getElementById('sname').value;
    const side = document.getElementById('sside').value;
    const queryName = `name=${name}`;
    const querySide = `side=${side}`;
    let url = 'http://localhost:3000/generals/search';

    if(name && !side) {
        url += '?' + queryName;
    } else if(name && side) {
        url += '?' + queryName + '&' + querySide;
    } else if(!name && side) {
        url += '?' + querySide;
    }

    const result = document.getElementById('result');

    fetch(url)
        .then(data => data.json())
        .then(json => {
            result.innerHTML = '';
            json.forEach(general => constructList(general, result));
        })
        .catch(error => console.error(error))
});

(function() {
    const tbody = document.querySelector('tbody');

    function constructTable(general) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${general.name}</td>
            <td>${general.side}</td>
            <td><button>Update</button></td>
            <td><button data-id=${general._id}>Delete</button></td>`;
        tbody.appendChild(tr);

        document.querySelector(`button[data-id="${general._id}"]`).addEventListener('click', event => {
            event.preventDefault();
            const id = event.target.dataset.id;
            ajax('http://localhost:3000/generals/delete', {
                method: 'DELETE',
                body: JSON.stringify({ _id: id }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        });
    }

    fetch('http://localhost:3000/generals')
        .then(data => data.json())
        .then(json => {
            json.forEach(general => constructTable(general));
        })
        .catch(error => console.error(error));

})();