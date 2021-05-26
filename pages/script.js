window.addEventListener('load', (e) => {
    loadFromServer()
});

function clearList() {
    let list = document.querySelector('#list')  // luam lista unde s-au incarcat produse si le stergem pe toate

    for (let i = list.childElementCount; i > 0; i--) {
        list.removeChild(list.lastElementChild);
    }
}

function loadFromJson(productsData) {
    clearList()
    for (let itemData of productsData) {
        addItem(itemData);
    }
}


function addItem(data) {
    // data needs name, stock, measure, id (hidden)

    // item este produsul propriu-zis (container)
    let item = document.createElement('div')
    item.classList.add('item')

    // name
    let nameTag = document.createElement('span')
    nameTag.className = 'name-tag';
    nameTag.innerText = data.name
    item.appendChild(nameTag)

    // quantity
    let quantityTag = document.createElement('span')
    quantityTag.className = 'quantity-tag';
    quantityTag.innerText = data.stock
    item.appendChild(quantityTag)

    // measure
    let measureTag = document.createElement('span')
    measureTag.className = 'measure-tag';
    measureTag.innerText = data.measure
    item.appendChild(measureTag)

    // input for new quantity added

    let quantity = document.createElement('input')
    quantity.type = 'number';
    quantity.classList.add('quantity-input')

    // de aici avem butoanele pt aprovizionat, utilizat, sters produs
    let order = document.createElement('button')
    order.innerText = 'order'
    order.classList.add('order-button')
    order.onclick = (e) => {

        let id = data.id // retine id-ul, folosit la requesturi, in functie
        let orderQuantity = quantity.value; // .value mereu e disponibil pt input din form
        orderStock(id, orderQuantity, quantityTag) // facem requestul
    }
    let use = document.createElement('button')
    use.innerText = 'use'
    use.classList.add('order-button')
    use.onclick = (e) => {

        let id = data.id
        let orderQuantity = quantity.value;
        useStock(id, orderQuantity, quantityTag)
    }

    let deleteDiv = document.createElement('button')
    deleteDiv.innerText = 'delete'
    deleteDiv.className = 'delete'
    deleteDiv.classList.add('order-button')
    deleteDiv.onclick = (e) => {

        let id = data.id
        deleteProduct(id, item)
    }

    item.appendChild(quantity)
    item.appendChild(order)
    item.appendChild(use)
    item.appendChild(deleteDiv)

    // // adaugam un camp ascuns, care contine id-ul produsului
    // let hiddenId = document.createElement('span')
    // hiddenId.hidden = true;
    // hiddenId.innerText = data

    let list = document.querySelector('#list')
    list.appendChild(item);
}


function snackbar(message) {
    return undefined;
}

function orderStock(id, orderedQuantity, quantityDiv) {
    if (!parseInt(orderedQuantity) || !orderedQuantity) {
        snackbar('You didn\'t enter the quantity', 'red')
        return
    }
    // save changes to browser
    let newQuantity = parseInt(quantityDiv.innerText) + parseInt(orderedQuantity)
    quantityDiv.innerText = newQuantity
    // make request to DB too
    // TODO also reload changes from server ;(
    fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id,
            stock: newQuantity
        })
    })
        .then(data => data.json())
        .then(json => snackbar('orderedQuantity updated to ' + newQuantity + json['measure'], 'green'))
        .catch(err => alert(err))
}

function useStock(id, usedQuantity, quantityDiv) {
    if (!parseInt(usedQuantity) || !usedQuantity) {
        snackbar('You didn\'t enter the quantity', 'red')
        return
    }
    let newQuantity = parseInt(quantityDiv.innerText) - parseInt(usedQuantity)
    if (newQuantity < 0) {
        snackbar('you don\'t have this much quantity', 'red');
        return;
    }
    // save changes to browser
    quantityDiv.innerText = newQuantity
    // make request to DB too
    fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id,
            stock: newQuantity
        })
    })
        .then(data => data.json())
        .then(json => snackbar('usedQuantity updated to ' + newQuantity + json['measure'], 'green'))
        .catch(err => alert(err))
}

function deleteProduct(id, productDiv) {
    fetch(`/api/products/${id}`, {
        method: 'DELETE'
    })
        .then(res => {
            // update on browser
            productDiv.parentNode.removeChild(productDiv)
            snackbar('Produsul a fost sters cu succes', 'green')
        })
        .catch(err => alert(err))

}
function loadFromServer() {
    let h2 = document.querySelector('header > h2.no-query')
    h2.classList.remove('hidden');

    h2 = document.querySelector('header > h2.query')
    h2.classList.add('hidden');

    fetch('/api/products')
        .then(data => data.json())
        .then(jsonData => {
            loadFromJson(jsonData.products);
        })
        .catch(err => console.log(err))
}


function deleteSearch() {
    // and reload all data from server
    clearList()
    loadFromServer()
}

function submitSearch() {

    let h2 = document.querySelector('header > h2.no-query')
    h2.classList.add('hidden');

    const QUERY_URL = '/api/products/query/'
    let search = document.querySelector('#search-bar input').value; // TODO get from form
    // TODO add search to the h2 inside body
    h2 = document.querySelector('header > h2.query');
    h2.classList.remove('hidden')
    h2.lastElementChild.innerHTML = search;

    let searchEncoded = encodeURIComponent(search);
    fetch(QUERY_URL + searchEncoded)
        .then(req => req.json())
        .then(json => {
            loadFromJson(json.products)
        }) // TODO load the data
        .catch(err => console.log(err))
}