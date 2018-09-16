const get = async (url, params={})=> (await fetch(url, params)).json();
const post = async (url, params={})=> (await fetch(url, params));

document.getElementById('get-general').addEventListener('click', async (event)=> {
    event.preventDefault();

    const generals = await get('http://localhost:3000/generals');

    // console.log(generals);
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