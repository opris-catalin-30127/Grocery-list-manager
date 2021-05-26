function submitProduct() {
    let name, stock, measure
    name = document.getElementById('name')
    stock = document.getElementById('stock')
    measure = document.getElementById('measure')

    fetch('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name.value, stock: parseInt(stock.value), measure: measure.value
        })
    })
        .then(data => data.json())
        .then(json => {
            window.location = '/' // schimba pagina catre / dupa ce adauga noul obiect.
        })
        .catch(err => alert(err))
}