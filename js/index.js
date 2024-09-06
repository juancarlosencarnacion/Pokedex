//*Creando el header
const headerPrincipal = document.getElementById('header-principal').innerHTML = `
  <nav  class="glass header">
    <a href="index.html" id="header-titulo-link"><img src='/img/pokedex.png'></a>
    <form class="search-bar">
      <input type="text" id="input-buscar-pokemon">
      <div class="actions">
        <button id="btn-buscar-pokemon"><span class="material-icons">search</span></button>
    </form>
  </nav>
`

const contenedorPrincipal = document.getElementById('contenedor-principal')
const contenedorPaginacion = document.getElementById('pagination')

const consumirAPI = async (pokemonId) => {
  let url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
  try {
    let response = await fetch(url)
    let data = await response.json()

    let div = document.createElement('div')

    //Muestra los tipos si es 1 o 2
    let tipos = data.types.map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`)
    tipos = tipos.join('')
    div.className = 'div-pokemon'
    div.innerHTML = `
        <a href="pokemon.html?nombre=${data.name}"  rel="noopener noreferrer">
        <div class="div-img-pokemon">
          <p class='bg-id-pokemon'>${insertarCeros(data.id)}</p>
          <img
              src="${data.sprites.other['official-artwork'].front_default}"
              alt=""/>
        </div>
        <div class="div-info">
          <p>${insertarCeros(data.id)}</p>
          <h3>${data.name}</h3>
          </a>
          <div class="div-tipos">${tipos}</div>
        </div>
      `
      contenedorPrincipal.innerHTML=`
        <a href="#up"><img class="material-symbols-outlined upPage" src="/img/arrow_circle_up_50dp_5F6368_FILL0_wght400_GRAD0_opsz48.png" alt="arrow_circle_up"></a>
      `

    return { id: data.id, element: div }
  } catch (error) {
    console.error('Error al obtener el pokemon', error)
    return null
  }
}





let lista_pokemones = []
const mostrarPokemones = async () => {

  contenedorPaginacion.innerHTML = `
    <!--<nav class="nav-pagination">
      <ul class="pagination-list">
        <li id="previous" class="page-item"><a class="page-link" href="#">
          <span class="material-symbols-outlined">arrow_back_ios
          </span>Anterior</a>
        </li>
        <li id="next" class="page-item"><a class="page-link" href="#">
          Siguiente<span class="material-symbols-outlined"> arrow_forward_ios</span></a>
        </li>
      </ul>
  </nav>-->
    <div class="botones-paginacion">
      <a id="previous" href="#">
        <span class="material-symbols-outlined"> arrow_back_ios </span>Anterior</a
      >
      <a id="next" href="#">Siguiente
        <span class="material-symbols-outlined"> arrow_forward_ios </span></a
      >
    </div>
    
  `

  //*Paginacion
  const btnPrevious = document.querySelector("#previous")
  const btnNext = document.querySelector("#next")

  let offset = 1
  let limit = 11

  let promises = []
 
  const bucle = (offset, limit) => {
    promises = []
    for (let i = offset; i <= offset + limit; i++) {
      promises.push(consumirAPI(i))
    }
  }

  // Ordenar y mostrar la lista de pokemones por ID

  async function ordenarLista() {
    try {
      lista_pokemones = await Promise.all(promises)
      lista_pokemones.sort((a, b) => a.id - b.id)

      // removerDivs()

      lista_pokemones.forEach(pokemon => {
        if (pokemon) {
          contenedorPrincipal.appendChild(pokemon.element)
        }
      })

    } catch (error) {
      console.log(error)
    }
  }
  bucle(offset, limit);
  ordenarLista()

  btnPrevious.addEventListener('click', () => {
    if (offset > 1) {
      offset -= limit;
      if (offset < 1) {
        offset = 1;
      }
      removerDivs();
      bucle(offset, limit);
      ordenarLista()
    } else {
      console.log('Estás en la primera página');
    }
  });

  btnNext.addEventListener('click', () => {
    offset += limit
    removerDivs()
    bucle(offset, limit)
    ordenarLista()
  })
}
mostrarPokemones()

//Eliminar todos los divs
const removerDivs = () => {
  const divsPrincipal = document.querySelectorAll('#contenedor-principal > div');
  divsPrincipal.forEach(div => div.remove());

}

//Muestra el resultado de la busqueda
const infoPokemon = (imagen, data) => {
  contenedorPrincipal.innerHTML = `
    <img src="${imagen}" alt="">
    <label>Tipo: ${data.types[0].type.name}</label>
  `
}

const input_buscar_pokemon = document.getElementById('input-buscar-pokemon')
const btn_buscar_pokemon = document.getElementById('btn-buscar-pokemon')

btn_buscar_pokemon.addEventListener('click', (e) => {
  e.preventDefault()
  let inputPokemon = input_buscar_pokemon.value.trim()
  if (inputPokemon != '') {
    inputPokemon = inputPokemon.toLowerCase()
    console.log(inputPokemon)
    removerDivs()
    consumirAPI(inputPokemon).then(pokemon => {
      if (pokemon) {
        contenedorPrincipal.appendChild(pokemon.element)
      }
    })
  }
})
const insertarCeros = (num) => {
  return num < 10 && num >= 0 ? `#00${num}`
    : num >= 10 && num < 100 ? `#0${num}`
      : `#${num}`
}

// console.log(consumirAPI(1033))