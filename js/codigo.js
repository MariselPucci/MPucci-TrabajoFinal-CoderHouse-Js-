//====================================== ENTREGA FINAL - CURSO JAVASCRIPT - CODERHOUSE ==================================================

//=========================================================================================================================
// Variables globales

let ARRAYPRODUCTOS;
let categoriaTodos;
let categoriaClases;
let categoriaRoperito;
let contenedorProductos;

//=========================================================================================================================
// Funciones 

function inicializarElementos() {
  categoriaTodos = document.getElementById("btnTodos");
  categoriaClases = document.getElementById("btnClases");
  categoriaRoperito = document.getElementById("btnRoperito");
  contenedorProductos = document.getElementById("contenedor-productos");
}

function inicializarEventos(carrito) {
  categoriaTodos.onclick = () => pintarProductos(ARRAYPRODUCTOS,carrito);
  categoriaClases.onclick = () => pintarProductos(arrayFiltrarProductoPorCategoria("Clases"),carrito);
  categoriaRoperito.onclick = () => pintarProductos(arrayFiltrarProductoPorCategoria("Roperito"),carrito);
}

// Funcion para filtrar objetos por categorias 
// Como input toma un string y devuelve una lista de objetos (productos)
function arrayFiltrarProductoPorCategoria (nombreCategoria) {
  let arrayObjetosCategoria = ARRAYPRODUCTOS.filter(producto => producto.categoria === nombreCategoria);
  return arrayObjetosCategoria;
}

function pintarProductos(arrayProd,carrito) {
  contenedorProductos.innerHTML = "";
  arrayProd.forEach((producto) => {
    let column = document.createElement("div");
    column.className = "col-sm-6 col-md-3 mt-3";
    column.id = `columna-${producto.id}`;
    column.innerHTML = `
            <div class="card">
              <div class="inner"> 
                <img src="${producto.img}" class="card-img-top"><img/>
              <div/>
                <div class="card-body">
                  <p class="card-text ">
                    <b>${producto.nombre}</b>
                  </p>
                  <p class="card-text">
                    <b>${producto.detalle}</b>
                  </p>
                  <p class="card-text">
                    <b>$ ${producto.precio}</b>
                  </p>
            
                </div>
                <div class="card-footer">
                    <button class="btn btn-dark" id="botonAgregar-${producto.id}">AGREGAR</button>
                </div>
            </div>`;

    contenedorProductos.append(column);

    let botonAgregar = document.getElementById(`botonAgregar-${producto.id}`);
    let carritoContador = document.getElementById(`carrito-contador`)
    
    botonAgregar.onclick = () => {let pedido = new Pedido (producto, 1);
                                  let value = carrito.agregar(pedido)
                                  let idProducto = pedido.producto.id
                                  let indexOfPedido = carrito.pedidos.map(e => e.producto.id).indexOf(idProducto)
                                  let {pedidos, productosStock, contadorDelCarrito} = carrito
                                  const disponibilidad = indexOfPedido != -1 && productosStock.disponibilidadStock(idProducto, pedidos[indexOfPedido].cantidad)
      
                                  if (disponibilidad){
                                    mostrarMensajeConfirmacion("Producto agregado correctamente", "#40a483")
                                    carrito.actualizarCarrito()
                                    localStorage.setItem("contadorDelCarrito", `${contadorDelCarrito}`)
                                    carritoContador.innerHTML=`${contadorDelCarrito}`
                                  }
                                  else{
                                  if (value){
                                  carrito.eliminar(pedido)
                                  }
                                  }
                                };
  });  
}

function mostrarMensajeConfirmacion(mensaje, color) {
  Toastify ({
    text: mensaje,
    duration: 1500,
    close: true,
    gravity: "bottom",
    position: "right",
    style: {
      background: color,
    },
  }).showToast();
}

function mostrarCard(){
  let productsId = document.getElementById("products-id")
  let iconoCarrito = document.getElementById("icono-card")
  let cerrarCard = document.getElementById("btn-cerrar")
  iconoCarrito.onmouseover = () => {productsId.classList.add("productsMostrar")}
  cerrarCard.onclick = () => {productsId.classList.remove("productsMostrar")}
}

async function main() {
  try {
    Swal.fire({
      title: 'Bienvenid@s!',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
          Swal.showLoading()
      },
    });

    const response = await fetch(
      "https://633e375c83f50e9ba3ad63d5.mockapi.io/api/v1/productos"
    );
   
    const data = await response.json(); 
    swal.close()
    ARRAYPRODUCTOS = [...data];
    let productosStock = new ProductosStock()
    let carrito = new Carrito(productosStock)
    inicializarElementos();
    inicializarEventos(carrito);
    carrito.actualizarCarrito()
    pintarProductos(ARRAYPRODUCTOS,carrito)
    mostrarCard()
  } catch (error) {
    console.log(error);
    } 
}

async function finalizarYdisminuirStockDelServer(formulario,modalCarritoCompra){
  try{
    Swal.fire({
      title: 'Por favor aguarde un momento',
      html: 'Su compra esta siendo procesada',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
          Swal.showLoading()
      },
    });
    
   for (let pedido of modalCarritoCompra.carrito.pedidos){ 
    let {producto: {id,nombre,cantidad,precio,img,categoria,detalle}} = pedido
    let indexOfProducto = ARRAYPRODUCTOS.map(e => e.id).indexOf(id)
    console.log('cantidad a eliminar:',pedido.cantidad)
     const response1 = await fetch(
       `https://633e375c83f50e9ba3ad63d5.mockapi.io/api/v1/productos/${id}` 
      )
     const data =  await response1.json()
      console.log('response1-data',data)
     
     let cantidadNeta = data.cantidad - pedido.cantidad
     if (cantidadNeta<0 || data.cantidad===0){
      let msg = 'No hay suficiente stock'
      throw new Error(msg)
     } 
     
    const response2 = await fetch(
      `https://633e375c83f50e9ba3ad63d5.mockapi.io/api/v1/productos/${id}`,
      {method: "PUT",
      headers:{'Content-type': 'application/json; charset=UTF-8'},
      body: JSON.stringify({
        nombre: nombre,
        cantidad: cantidadNeta,
        precio: precio,
        img: img,
        categoria: categoria,
        detalle: detalle,
        id: id
      })
    } 
     )
     if (!response2.ok){
      let msg = response2.status + ', ' + response2.statusText
      throw new Error(msg)
    }  
  }  
    swal.close()
    Swal.fire(
      `Felicitaciones ${modalCarritoCompra.infoContacto.nombre} su compra fue exitosa!`,
      `Le enviaremos un email a ${modalCarritoCompra.infoContacto.email} con el detalle de su pedido`,
    )
    formulario.reset()
    modalCarritoCompra.modal.hide()
    modalCarritoCompra.carrito.finalizarCompraCarrito()
  } 
  catch (error) {
  console.log('ERROR:',error);
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: error
  })
  }
}

//=========================================================================================================================
// Clases

// Clase que maneja el stock disponible - control de stock
class ProductosStock {
  constructor() {
    this.productosTotales = ARRAYPRODUCTOS
  }

  verificarStock(id) {
    let checkado = this.productosTotales.some(function(e){
      if (e.id==id){
        const cantidadDisponible=e.cantidad;
        if (cantidadDisponible>0){
          return true
        }
      }
    })
    return checkado
  }

  disponibilidadStock(id,cantidad) {
    let indexOfProducto = this.productosTotales.map(e => e.id).indexOf(id)
    const cantidadDisponible = this.productosTotales[indexOfProducto]?.cantidad
    if (cantidadDisponible===undefined){
      console.log(`No existe el producto con el id correspondiente.`)
      return undefined
    }
    else if (cantidad === undefined){
      return undefined
    }
    else if (this.verificarStock(id) && cantidadDisponible>=cantidad && cantidad != undefined){
      return true
    } 
    else{
      mostrarMensajeConfirmacion(`No hay suficiente stock. Stock disponible ${this.productosTotales[indexOfProducto].cantidad}`,"#E28553"); 
      return false
    }
  }

  disminuirStock (id,cantidad) {
    let indexOfProducto = this.productosTotales.map(e => e.id).indexOf(id)
    for (let producto of this.productosTotales) {
      if (producto.id === id) {
       //Esto disminuye la cantidad al stock 
       this.productosTotales[indexOfProducto].cantidad -= cantidad; 
       break;
     } else {
       continue;
     }
    }
  }
} //Fin clase ProductosStock

// Arma el pedido que despues va a ser pusheado al carrito
class Pedido {
  constructor(producto,cantidad) {
      this.producto = producto;
      this.cantidad = cantidad;
  }
  calcularMontoPedido() {
      let montoPedido = this.cantidad * this.producto.precio;
      return parseFloat(montoPedido.toFixed(2));
    }
}

//Clase que contiene un modal con formulario para realizar el checkout de la cmompra
class ModalCarritoCompra{
  constructor(carrito){
    this.carrito = carrito
    let modalIniciarCompra = document.getElementById("modalCarritoCompra");
    
    this.modal = new bootstrap.Modal(modalIniciarCompra);
    this.infoContacto = {}
  }

  guardarInformacionDeContacto(){
    let apellidoNombre = document.getElementById("nombre")
    let email = document.getElementById("email")
    let numeroDeTarjeta = document.getElementsByClassName("numeroDeTarjeta")
    let telefono = document.getElementById("telefono")
    this.infoContacto["telefono"] = parseInt(telefono.value)
    this.infoContacto["email"] = email.value
    this.infoContacto["nombre"] = apellidoNombre.value
    this.infoContacto["numeroDeTarjeta"] = parseInt(numeroDeTarjeta.value)
  }

  abrirModal(){
    if (this.carrito.pedidos.length !=0) {
      const totalCompra = document.getElementById("totalCompra")
      const resultado = document.getElementById("montoCuota");
      totalCompra.textContent = `MONTO TOTAL: $ ${this.carrito.totalCarrito()}`
      resultado.textContent = `1 Cuota de $ ${this.carrito.totalCarrito()}.-`;
      let selectCuota = document.getElementById("select-cuota")
      
      selectCuota.addEventListener('change', (event) => {
        switch (event.target.value) {
          case "1": resultado.textContent = `${event.target.value} cuota de $ ${this.carrito.totalCarrito()}.-`;
                    totalCompra.textContent = `MONTO TOTAL: $ ${this.carrito.totalCarrito()}`
          break;
          case "3": resultado.textContent = `${event.target.value} cuotas de $ ${(this.carrito.totalCarrito()/3).toFixed(2)}.-`;
                    totalCompra.textContent = `MONTO TOTAL: $ ${this.carrito.totalCarrito()}`
          break;
          case "6": resultado.textContent = `${event.target.value} cuotas de $ ${(this.carrito.totalCarrito()*1.1/6).toFixed(2)}.-`;
                    totalCompra.textContent = `MONTO TOTAL: $ ${(this.carrito.totalCarrito()*1.1).toFixed(2)}`
          break;
          case "12": resultado.textContent = `${event.target.value} cuotas de $ ${(this.carrito.totalCarrito()*1.2/12).toFixed(2)}.-`;
                     totalCompra.textContent = `MONTO TOTAL: $ ${(this.carrito.totalCarrito()*1.2).toFixed(2)}`
          break;
        } 
    });
      this.modal.show()
    } 
  }

  cerrarModal () {
    let botonCerrarModal = document.getElementById("btn-cerrar-modal")
    botonCerrarModal.onclick = () => this.modal.hide()
  }

  comprar(){
    let formularioCompra = document.getElementById("formularioComprarCarrito")
    formularioCompra.onsubmit = (event) => {
      event.preventDefault();
      this.guardarInformacionDeContacto()
      Swal.fire({
        title: 'Desea confirmar la compra?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          finalizarYdisminuirStockDelServer(formularioCompra,this)
        }
      })
    }
  }
}//Finclase ModalCarritoCompra


//Clase que tiene metodos para llenar el carrito, actualizar las cantidades, borra productos del pedido
class Carrito{
  constructor(productosStock){
    if (localStorage.length != 0){
      this.contadorDelCarrito = parseInt(localStorage.getItem("contadorDelCarrito"))
      let listaDePedidosJSON = localStorage.getItem("pedidos")
      console.log(listaDePedidosJSON)
      let listaDePedidos = JSON.parse(listaDePedidosJSON)
      let pedidos =[]
      //Convierto la info de los pedidos en instancias de Pedido:
      for (let pedido of listaDePedidos){
        const {producto, cantidad} =  pedido
        pedidos.push(new Pedido(producto,cantidad))
      }
      this.pedidos = pedidos
    } 
    else{
      this.pedidos = [];
       this.contadorDelCarrito = 0;
    }
    this.productosStock = productosStock
  }


  actualizarCarrito() {    
    let pedidosJSON = JSON.stringify(this.pedidos);
    localStorage.setItem("pedidos", pedidosJSON);
    localStorage.setItem("contadorDelCarrito",`${this.contadorDelCarrito}`)
    this.pintarCarrito()
  }


  eliminar(pedido){
    let indexOfPedido = this.pedidos.map(e => e.producto.id).indexOf(pedido.producto.id)
    indexOfPedido==-1 ? this.pedidos.splice(indexOfPedido,1) : this.pedidos[indexOfPedido].cantidad -= pedido.cantidad;
    this.contadorDelCarrito--
  }


  agregar(pedido){
    //Verifico si hay stock y procede a agregar al carrito.
    let {producto, cantidad} = pedido  
    let indexOfPedido = this.pedidos.map(e => e.producto.id).indexOf(producto.id)
    const disponibilidadStock = this.productosStock.disponibilidadStock(producto.id, cantidad)

    if (disponibilidadStock){
      indexOfPedido ==-1 ? this.pedidos.push(pedido) : this.pedidos[indexOfPedido].cantidad += cantidad;

      this.contadorDelCarrito++
      return true
    }
    else{
      return false
    }
  }

  borrarOnClick(id){
    let indiceBorrar = this.pedidos.findIndex(
      (pedido) => Number(pedido.producto.id) === Number(id)
    );
    this.contadorDelCarrito -=  this.pedidos[indiceBorrar].cantidad
    this.pedidos.splice(indiceBorrar, 1);
    // Esto elimina del DOM el pedido eliminado del carrito
    let productoABorrar = document.getElementById(`contenedor-pedido-${id}`);
    productoABorrar.remove();
    let contenedorMontoTotal = document.getElementById("contenedor-monto-total");
    contenedorMontoTotal.innerHTML = `MONTO TOTAL: ${this.totalCarrito()}`;
    mostrarMensajeConfirmacion("Producto eliminado correctamente", "#f4004f")
    this.actualizarCarrito();
  }

  vaciarCarrito(){
    this.pedidos=[]
    let carritoContador = document.getElementById(`carrito-contador`)
    this.contadorDelCarrito = 0
    carritoContador.innerHTML = `${this.contadorDelCarrito}`
    localStorage.clear()
    this.actualizarCarrito()
  }

  totalCarrito () {
    let total = 0;
    for (let pedido of this.pedidos) {
      total += pedido.calcularMontoPedido();
    }
    return total;
  }

  //Muestra los pedidos del carrito
  pintarCarrito(){
    let carritoContador = document.getElementById("carrito-contador")
    carritoContador.innerHTML = this.contadorDelCarrito
    let totalCompra = document.getElementById("card-items-id");
    let pedidos = this.pedidos
    totalCompra.innerHTML = "";
    let vaciarCarrito = document.createElement("div")
    vaciarCarrito.className = "container p-3 d-flex justify-content-between"
    vaciarCarrito.innerHTML = `
    <h3 class="">Mi carrito<h3/>
    <a id ="eliminar-carrito" href="#">
    <img src="img/icono_papelera.png" alt="">
    <a>
    `
    totalCompra.append(vaciarCarrito)
   
    let eliminarCarrito = document.getElementById("eliminar-carrito")
    eliminarCarrito.onclick = () => this.vaciarCarrito()

    pedidos.forEach((pedido) => {
      let row = document.createElement("div");
      row.className = "row mt-3";
      row.id = `contenedor-pedido-${pedido.producto.id}`
      row.innerHTML = `
      <div class="item"> 
          <img src="${pedido.producto.img}"></img>
          <div class="item-content"
            <h5><b>${pedido.producto.nombre}</b></h5>
            <h5><b>${pedido.producto.detalle}</b></h5>
            <h5>Cantidad: <b>${pedido.cantidad}</b></h5>
            <h6>Precio Unitario: <b>$ ${pedido.producto.precio}</b></h6>
          </div>
          <span id="botonEliminar-${pedido.producto.id}" class="btn-eliminar">X</span> 
      </div>
      `
    totalCompra.append(row)
    
    let botonEliminar = document.getElementById(`botonEliminar-${pedido.producto.id}`);
    botonEliminar.onclick = () => this.borrarOnClick(pedido.producto.id);

  }) 


    let totalCarrito = document.createElement("div")
    totalCarrito.innerHTML= `<h4 id="contenedor-monto-total" class="mt-3"> MONTO TOTAL: $ ${this.totalCarrito()} </h4>` 
    totalCompra.append(totalCarrito)

    let finalizarCompra = document.createElement("div")
    finalizarCompra.innerHTML = `<button id= "boton-iniciar-compra" class="btn m-3">INICIAR COMPRA</button>`
    totalCompra.append(finalizarCompra)

    let botonIniciarCompra = document.getElementById("boton-iniciar-compra");
    let modal = new ModalCarritoCompra(this)
    botonIniciarCompra.onclick = () => {modal.abrirModal()
                                        modal.comprar()
                                        modal.cerrarModal()}
  }

  finalizarCompraCarrito () {
    // Disminuye la cantidad de productos comprados en el stock disponible
    for (let pedido of this.pedidos) {
      let {producto: {id}, cantidad} = pedido
      this.productosStock.disminuirStock(id, cantidad)
    }
    this.vaciarCarrito()
  }
} //Fin de clase Carrito

//=========================================================================================================================
//Llamado a la funcion main
main()



