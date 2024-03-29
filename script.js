async function GetPokemons() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=200");
  const data = await res.json();

  const pokemonData = await Promise.all(
    data.results.map(async (pokemon) => {
      const res = await fetch(pokemon.url);
      const pokemonData = await res.json();
      const typeNames = pokemonData.types.map((type) => type.type.name);

      return {
        pokemonData: pokemonData,
        name: pokemon.name,
        imageUrl: pokemonData.sprites.other["official-artwork"].front_default,
        desc: pokemonData.weight,
        exp: pokemonData.base_experience,
        types: typeNames,
      };
    })
  );
  console.log(pokemonData, "pokemons");
  DisplayPokemonCards(pokemonData);
}

function DisplayPokemonCards(pokemonData) {
  const pokemonCardsContainer = document.querySelector(".all-pokemon-cards");
  const template = document.querySelector("#pokemon-card-template");

  pokemonData.forEach((pokemon) => {
    const clone = template.content.cloneNode(true);

    clone.querySelector("img").src = pokemon.imageUrl;
    clone.querySelector(".name").textContent = pokemon.name.toUpperCase();
    clone.querySelector(".weight").textContent = `${pokemon.desc} kg`;
    clone.querySelector(".types").textContent = pokemon.types.join(", ");
    clone.querySelector(".exp").textContent = pokemon.exp;

    pokemonCardsContainer.appendChild(clone);
  });
}

GetPokemons();
