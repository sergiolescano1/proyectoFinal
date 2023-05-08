
let carrito = [];
let valorFinalizacion = 0

//presionar boton de agregar productos
const productoContenedor = document.getElementById('producto-contenedor'); //
productoContenedor.addEventListener('click', (e) => {
  if (e.target.classList.contains('agregar')) {//si presiono sobre un boton que tenga asiganada la clase "agregar"
    //librerias para avisar que se agregó porducto
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Agregado Correctamente!',
      showConfirmButton: false,
      timer: 1500
    })
    verificacionProducto(e.target.id)               //tengo que verificar si el producto habia sido seleccionado previamente 
  };
})


const verificacionProducto = async (productoId) => {   //ver si esta o lo agrego
  //  console.log(productoId)         
  const enLista = carrito.some(producto => producto.id == productoId)  //busco si ya se encontraba precargado en la lista 

  if (!enLista) {
    console.log("No Esta repetido")
    const data = await getProducts()
    const producto = data.find(producto => producto.id == productoId) //caso 1: si no se repite agrego todas sus propiedades
    console.log(producto)
    if (producto.cantidad == 0) //al no estar repetido le asigno el valor =1 
    {
      producto.cantidad = 1
    }
    carrito.push(producto)       //agrego al carrito el objeto producto                                   
    completarTablaCarrito(producto)
  } else {  //EL PRODUCTO SE ENCUENTRA COMPRADO POR LO TANTO SOLO INCREMENTO CANTIDAD
    console.log(" Esta repetido")
    const productoRepetido = carrito.find(producto => producto.id == productoId)//caso 2_ si se encontraba repetido  //FIND DEVUELVE BOOLEN
    const cantidad = document.getElementById(`cantidad${productoRepetido.id}`) //incremento cantidad 
    productoRepetido.cantidad++
    cantidad.innerText = `Cantidad: ${productoRepetido.cantidad}`            //modifico la cantidad en la tabla

    const subtotal1 = document.getElementById(`subtotal${productoRepetido.id}`)
    let subtotalTabla = productoRepetido.precio * productoRepetido.cantidad
    subtotal1.innerText = `$${subtotalTabla}`  //muestro el subtotal en la tabla      
    total()

  }
}

completarTablaCarrito = (producto) => {   //actualizo la tabla
  const contenedor = document.getElementById('carrito-contenedor')
  const tr = document.createElement('tr')

  let subtotalTabla = producto.precio * producto.cantidad
  tr.innerHTML = `
				<td>${producto.nombre}</td>
				<td>${producto.precio}</td>
        <td id=cantidad${producto.id}>Cantidad: ${producto.cantidad}</td>
        <td id=subtotal${producto.id}>$${subtotalTabla} </td>
        <td  class="d-flex justify-content-center"><button  class="btn btn-danger eliminar" value="${producto.id}">X</button></td>
  `
  contenedor.appendChild(tr)
  total()
}

//Calculo el valor final de la compra y agrego a la tabla
//const verificacionProducto = async(productoId) => {   //ver si esta o no agregado
//const data =await getProducts()

async function total() {
  const cantidadCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0)
  const precioTotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)


  const totalmente = document.getElementById('total') //incremento cantidad 
  totalmente.innerText = `$${precioTotal}`

  guardarCarritoStorage(carrito)

  //Busco valor promedio del dolar y lo guaro en variable global valorFinalizacion
  const valor1 = await getValor() //funcion que envia el valor promedio del dolar 
  const totalmenteUsd = document.getElementById('totalUsd') //incremento cantidad 
  totalmenteUsd.innerText = `USD ${(precioTotal / valor1).toFixed(2)}`
  valorFinalizacion = precioTotal
}



//boton eliminar 
const productoEliminar = document.getElementById('tablaCompras'); //
productoEliminar.addEventListener('click', (e) => {  //si presiono sobre un boton que tenga asiganada la clase "agregar"
  if (e.target.classList.contains('eliminar')) {
    eliminarProductoCarrito(e.target.value)
  };
})

const eliminarProductoCarrito = (productoId) => { //luego de presionar el boton elimino objeto de carrito 
  const productoIndex = carrito.findIndex(producto => producto.id == productoId);
  if (productoIndex !== -1) {
    carrito[productoIndex].cantidad = 0; // Modificar la cantidad del producto a 0
    console.log("Se ha modificado la cantidad del producto en el carrito.");
  } else {
    console.log("No se ha encontrado el producto en el carrito.");
  }
  console.log(carrito);
  carrito.splice(productoIndex, 1)
  reconstruirTabla(carrito);

};



const reconstruirTabla = (carrito) => {//una vez eliminado el objeto del carrito reconstruyo la tabla
  const contenedor = document.getElementById('carrito-contenedor')

  contenedor.innerHTML = '' //elimino tabla desactualizada
  total()
  carrito.forEach(producto => { //por cada producto lo agrego a la tabla
    const contenedor = document.getElementById('carrito-contenedor')
    const div = document.createElement('tr')

    let subtotalTabla = producto.precio * producto.cantidad
    div.innerHTML = `
				<td>${producto.nombre}</td>
				<td>${producto.precio}</td>
        <td id=cantidad${producto.id}>Cantidad: ${producto.cantidad}</td>
        <td id=subtotal${producto.id}>$${subtotalTabla} </td>
        <td  class="d-flex justify-content-center"><button  class="btn btn-danger eliminar" value="${producto.id}">X</button></td>
  `
    contenedor.appendChild(div)
    total()  //funcion para colocar el precio total en la tabla
  });
}

//FUNCIONES DE GUARDADO 
const guardarCarritoStorage = (carrito) => {
  localStorage.setItem('carrito', JSON.stringify(carrito))//genero JSON
}


const obtenerCarritoStorage = () => {//funcion para mostrar informacion almacenada en storage
  const carritoStorage = JSON.parse(localStorage.getItem('carrito'))
  return carritoStorage
}



if (localStorage.getItem('carrito')) { //muestra informacion almacenada en storage 
  carrito = obtenerCarritoStorage()
  reconstruirTabla(carrito)
}




//FINALIZAR COMPRA
const finalizarTabla = document.getElementById('tablaCompras');
finalizarTabla.addEventListener('click', (e) => {
  // console.log(e.target.classList)
  if (e.target.classList.contains('Finalizar')) {//si presiono sobre un boton que tenga asiganada la clase "finalizar" abro librerias
    Swal.fire({
      title: `El precio final es: $${valorFinalizacion}. \nComplete sus datos para finalizar`,

      //defino email y telefono
      html:
        '<label for="email">Email:</label>' +
        '<input id="email" type="email" autocapitalize="off" class="swal2-input" required>' +
        '<label for="telefono">Teléfono:</label>' +
        '<input id="telefono" type="tel" autocapitalize="off" class="swal2-input" required>',
      showCancelButton: true,
      confirmButtonText: 'ACEPTAR',
      cancelButtonText: 'CANCELAR',
      inputValidator: (value) => { //validacion de los campos
        if (!value.email || !value.telefono) {
          return 'Debe completar ambos campos';
        }
      },
    }).then((result) => {
      if (result.isConfirmed) { //si coloco aceptar 
        const emailInput = document.getElementById('email');
        const telefonoInput = document.getElementById('telefono');
        const email = emailInput.value;
        const telefono = telefonoInput.value;
        if (!emailInput.checkValidity() || !telefonoInput.checkValidity()) { //validacion
          Swal.fire({ //mensaje de error
            icon: 'error',
            title: 'Error',
            text: 'Los datos ingresados no son válidos',
          });
          return;
        }


        // aceptados los datos ingresados
        Swal.fire({
          icon: 'success',
          title: 'Agregado Correctamente55555',
          text: 'En breve lo contactaremos',
        })
      }
      else {
        //NO HACER NADA SI SE COLOCA "NO"
      }
    });
  }
})


