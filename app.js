/**
 * Replaces a string in a string with a substitute
 * Useful because names such as 'John Bell Hood' become arrays of strings split on a space
 * when used by the data attribute (Ex: dataset.name = ['John', 'Bell', 'Hood'])
 * We don't want this behavior.
 * @param {string} string 
 * @param {string} replace 
 * @param {string} sub 
 */
const swapChars = (string, replace, sub) => {
    string = string.trim();
    do {
        string = string.replace(replace, sub);
    } while(string.includes(replace));
    return string;
}

/**
 * Constructs a list item for an object and appends it to a list
 * @param {Object} object 
 * @param {HTMLUListElement} ul 
 */
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

// Gets the generals from mongo via fetch
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

// adds a general to mongo via fetch
document.getElementById('submit').addEventListener('click', event => {
    event.preventDefault();

    const general = {
        name: document.getElementById('name').value,
        side: document.getElementById('side').value
    }

    fetch('http://localhost:3000/generals', {
        method: 'POST',
        body: JSON.stringify(general),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(data=> createTable());
});

// Searches the generals using a query string.  Express uses regex so terms don't have to be exact
document.getElementById('search').addEventListener('click', event => {
    event.preventDefault();

    const name = document.getElementById('sname').value;
    const side = document.getElementById('sside').value;
    const queryName = `name=${name}`;
    const querySide = `side=${side}`;
    let url = 'http://localhost:3000/generals/search';

    // construct the query string
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


/**
 * Creates a table with civil war generals pulled from Mongo
 * This function is a mess and in the real world I'd refactor it into smaller chunks
 * But as this is just an exploratory project to work with mongo, this will do.
 * @param {Object} event 
 */
function createTable(event) {
    // This function is not always called as an event
    if(event) {
        event.preventDefault();
    }

    // table body
    const tbody = document.querySelector('tbody');

    // update form elements
    const update = {
        name: document.getElementById('uname'),
        side: document.getElementById('uside'),
        btn: document.getElementById('update')
    }

    //clear the table before we start any work
    tbody.innerHTML = '';

    /**
     * Constructs a table row from the generals we've grabbed from Mongo
     * @param {Object} general 
     */
    function constructTableRow(general) {

        // create a table element, and swap spaces for # to ensure names aren't split into arrays
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${general.name}</td>
            <td>${general.side}</td>
            <td><button 
                data-name=${swapChars(general.name, ' ', '#')} 
                data-side=${general.side}
                data-updateid=${general._id}>
                Update
            </button></td>
            <td><button data-deleteid=${general._id}>Delete</button></td>`;
        tbody.appendChild(tr);

        // attach an event listener to the delete button to call the delete route defined in express
        document.querySelector(`button[data-deleteid="${general._id}"]`)
            .addEventListener('click', event => {
                event.preventDefault();
                const id = event.target.dataset.id;
                fetch('http://localhost:3000/generals/delete', {
                    method: 'DELETE',
                    body: JSON.stringify({ _id: id }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(data=> createTable())
                    .catch(error=> console.error(error));
        });

        // attach an event listener to send general's information to the update form
        document.querySelector(`button[data-updateid="${general._id}"]`)
            .addEventListener('click', event => {
                event.preventDefault();
                const general = {
                    name: swapChars(event.target.dataset.name, '#', ' '),
                    side: event.target.dataset.side
                }

                update.name.value = general.name;
                update.side.value = general.side;
                update.name.dataset.name = swapChars(general.name, ' ', '#');
                update.side.dataset.side = general.side;
                update.btn.disabled = false;
                update.name.readOnly = false;
                update.side.readOnly = false;
        });
    } // end constructTableRow()

    // now fetch the generals and build the table!
    fetch('http://localhost:3000/generals')
        .then(data => data.json())
        .then(json => {
            json.forEach(general => constructTableRow(general));
        })
        .catch(error => console.error(error));
}

// update the general in the update form using the update route defined in Express
document.getElementById('update').addEventListener('click', event => {
    event.preventDefault();

    // update form elements
    const update = {
        name: document.getElementById('uname'),
        side: document.getElementById('uside'),
        btn: document.getElementById('update')
    }

    // construct the url and query string
    let url = 'http://localhost:3000/generals/update?';
    url += `name=${update.name.value}`;
    url += `&side=${update.side.value}`;
    url += `&oname=${swapChars(update.name.dataset.name, '#', ' ')}`;
    url += `&oside=${update.side.dataset.side}`;
    console.log(url);

    // update the general via fetch
    fetch(url, {
        method: 'PUT'
    }).then(data => {
        createTable();
        update.name.value = '';
        update.side.value = '';
        update.btn.disabled = true;
        update.name.readOnly = true;
        update.side.readOnly = true;
    }).catch(error => console.error(error));
});

document.getElementById('refresh').addEventListener('click', createTable);

createTable();