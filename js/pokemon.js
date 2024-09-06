const body = document.querySelector("#body");
const title = document.querySelector("#title");

const currentUrl = window.location.href;
const url = new URL(currentUrl);
const queryParams = url.searchParams;
const nombrePokemon = queryParams.get("nombre");

// Función para modificar la primera letra de la cadena
function upper(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
title.innerHTML = upper(nombrePokemon);

//*Creando el header
const headerPrincipal = (document.getElementById(
  "header-principal"
).innerHTML = `
  <nav class="glass header">
    <a href="index.html" id="header-titulo-link"><img src='/img/pokedex.png'></a>
    <!--<form class="search-bar">
      <input type="text" id="input-buscar-pokemon">
      <div class="actions">
        <button id="btn-buscar-pokemon"><span class="material-icons">search</span></button>
      </div>
    </form>-->
  </nav>
`);

const stats = async (i) => {
  let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
  try {
    let response = await fetch(url);
    let data = await response.json();

    let tipos = data.types.map(
      (type) => `<p class="tipo ${type.type.name} glass">${type.type.name}</p>`
    );
    tipos = tipos.join("");

    let habilidades = data.abilities.map(
      (ability) =>
        `<p class="${ability.ability.name} glass  habilidad">${ability.ability.name}</p>`
    );
    habilidades = habilidades.join("");

    // Cálculo para obtener altura y peso
    let pokeHeight = (data.height / 10).toFixed(1);
    let pokeWeight = (data.weight * 0.1).toFixed(1);

    const main = document.createElement("main");
    main.classList.add("main");

    main.innerHTML = `
      <div class="info">
        <div class="pokemon glass">
          <img src="${data.sprites.other["official-artwork"].front_default}"
          alt="${data.name}">
        </div>
        <div class="descript glass">
          <p class="title">${data.name}</p>
          <p>
            Soy ${data.name}, un Pokémon de tipo "${data.types[0].type.name}"
            con habilidades únicas que me destacan en cualquier situación. Mis
            estadísticas muestran una salud formidable y un ataque de nivel
            ${data.stats[1].base_stat}, lo que me convierte en un adversario
            formidable en batalla. Estoy seguro de que mi presencia en cualquier
            equipo Pokémon será una adición valiosa. ¡Espero que estén tan
            emocionados como yo de aprender más sobre mí!
          </p>
        </div>
      </div>
      <div class="detalle">
        <div class="types">
          <div class="type">
            <p class="title">Tipos:</p>
            ${tipos}
          </div>
          <div class="experience">
              <p class="title">Experiencia:</p>
              <p class="xp glass">${data.base_experience}</p>
          </div>
        </div>
        <div class="contenedor-chart glass">
          <canvas id="statsChart"></canvas>
          <div class="peso-altura">
            <p class="title">Peso:</p>
            <p class="tipo">${pokeWeight}KG</p>
            <p class="title">Altura:</p>
            <p class="tipo">${pokeHeight}M</p>
          </div>
        </div>
        <div class="abilities">
          <p class="title">Habilidades:</p>
          <div class="ability">${habilidades}</div>
        </div>
      </div>
      <div class="evolutions glass">
        <p class="title title-evolution">Evoluciones</p>
        <div class="evolutions-content"></div>
      </div>
    `;

    document.body.appendChild(main);
    body.classList.add(`fondo-${data.types[0].type.name}`);

    const ctx = document.getElementById("statsChart").getContext("2d");
    const chartData = {
      labels: data.stats.map((stat) => stat.stat.name),
      datasets: [
        {
          label: "Estadísticas",
          data: data.stats.map((stat) => stat.base_stat),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 205, 86, 0.6)",
            "rgba(201, 203, 207, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(111, 0, 255, 0.6)",
          ],
          borderColor: [
            "rgb(255, 99, 132)",
            "rgb(75, 192, 192)",
            "rgb(255, 205, 86)",
            "rgb(201, 203, 207)",
            "rgb(54, 162, 235)",
            "rgb(111, 0, 255)",
          ],
          borderWidth: 1,
        },
      ],
    };

    new Chart(ctx, {
      type: "polarArea",
      data: chartData,
      options: {
        plugins: {
          legend: {
            display: false,
            onClick: null,
            labels: {
              font: {
                family: "Oswald",
                size: 16,
              },
              color: "#333",
            },
          },
          datalabels: {
            color: "black",
            font: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return {
                family: "Oswald",
                size: value <= 35 ? 12 : 14,
                weight: 600
              };
            },
            formatter: (value, context) => {
              const label = context.chart.data.labels[context.dataIndex];
              const abbreviationMap = {
             

                "hp": "HP",
                "attack": "ATK",
                "defense": "DEF",
                "special-attack": "SP-ATK",
                "special-defense": "SP-DEF",
                "speed": "SPD"
                // Agrega más abreviaciones según sea necesario

              };
              const abbreviatedLabel = abbreviationMap[label] || label;
              return abbreviatedLabel + ': ' + value;
            },
          },
        },
        scales: {
          r: {
            ticks: {
              display: false,
            },
            pointLabels: {
              font: {
                family: "Oswald",
                size: 16,
              },
              color: "#333",
            },
          },
        },
      },
      plugins: [ChartDataLabels]
    });

    obtenerEvoluciones(data.species.url);

  } catch (error) {
    console.error("Error al obtener el pokemon", error);
    return null;
  }
};

const obtenerEvoluciones = async (speciesUrl) => {
  try {
    let response = await fetch(speciesUrl);
    let data = await response.json();
    let evolutionChainUrl = data.evolution_chain.url;

    response = await fetch(evolutionChainUrl);
    let evolutionData = await response.json();

    const evolutionChain = [];
    let currentEvolution = evolutionData.chain;

    do {
      // Obtener los detalles del Pokémon actual en la cadena de evolución
      const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${currentEvolution.species.name}`);
      const pokemonData = await pokemonResponse.json();

      const evoDetails = currentEvolution.evolution_details[0] || {};
      evolutionChain.push({
        "species_name": currentEvolution.species.name,
        "min_level": evoDetails.min_level,
        "trigger_name": evoDetails.trigger && evoDetails.trigger.name,
        "item": evoDetails.item,
        "image": pokemonData.sprites.other["official-artwork"].front_default  // Obtener la imagen del Pokémon
      });

      currentEvolution = currentEvolution['evolves_to'][0];
    } while (!!currentEvolution && currentEvolution.hasOwnProperty('evolves_to'));

    const evolutionsContent = document.querySelector(".evolutions-content");
    evolutionChain.forEach(evo => {
      evolutionsContent.innerHTML += `
        <div class="evolution glass">
          <img src="${evo.image}" alt="${evo.species_name}">
          <p>${upper(evo.species_name)}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error al obtener las evoluciones", error);
  }
};

stats(nombrePokemon);
const removerDivs = () => {
  const main = document.querySelectorAll(".main");
  main.forEach((main) => main.remove());
};
