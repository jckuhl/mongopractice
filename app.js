const get = async (url, params={})=> (await fetch(url, params)).json();
const post = async (url, params={})=> (await fetch(url, params));

const ul = document.getElementById('ul');

function constructList(object) {
    console.log(object);
    li = document.createElement('li');
    for(let prop in object) {
        if(object.hasOwnProperty(prop) && prop !== '_id') {
            li.innerHTML += object[prop] + ' ';
            ul.appendChild(li);
        }
    }
    ul.appendChild(li);
}

document.getElementById('get-general').addEventListener('click', (event)=> {
    event.preventDefault();

    fetch('http://localhost:3000/generals')
        .then(data=> data.json())
        .then(json=> {
            ul.innerHTML = '';
            json.forEach(general=> constructList(general))
        })
        .catch(error=> console.error(error));
});

document.getElementById('submit').addEventListener('click', event => {
    event.preventDefault();

    const general = {
        name: document.getElementById('name').value,
        side: document.getElementById('side').value
    }

    post('http://localhost:3000/generals', {
        method: 'POST',
        body: JSON.stringify(general),
        headers: {
            'Content-Type': 'application/json'
        }
    });
})