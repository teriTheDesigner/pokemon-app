async function GetPokemons() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=200");
  const data = await res.json();

  const pokemonData = await Promise.all(
    data.results.map(async (pokemon) => {
      const res = await fetch(pokemon.url);
      const pokemonData = await res.json();
      const typeNames = pokemonData.types.map((type) => type.type.name);
      // const abilityNames = pokemonData.abilities.map(
      //   (ability) => ability.ability.name
      // );
      const abilityPromises = pokemonData.abilities.map(async (ability) => {
        const abilityRes = await fetch(ability.ability.url);
        const abilityData = await abilityRes.json();
        const englishEffect = abilityData.effect_entries.find(
          (entry) => entry.language.name === "en"
        );
        return {
          name: ability.ability.name,
          effect: englishEffect ? englishEffect.effect : "Effect not available",
        };
      });
      const abilities = await Promise.all(abilityPromises);
      console.log(abilities, "abilities");

      return {
        pokemonData: pokemonData,
        name: pokemon.name,
        imageUrl: pokemonData.sprites.other["official-artwork"].front_default,
        desc: pokemonData.weight,
        exp: pokemonData.base_experience,
        types: typeNames,

        abilities: abilities,
      };
    })
  );

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
    clone.querySelector(".pokemon-card").addEventListener("click", () => {
      displayModal(pokemon);
    });
    pokemonCardsContainer.appendChild(clone);
  });
}
// Display modal function
function displayModal(pokemon) {
  const modal = document.getElementById("modal");
  const modalImage = document.querySelector(".modal-image");
  const modalName = document.querySelector(".modal-name");
  const modalWeight = document.querySelector(".modal-weight");
  const modalTypes = document.querySelector(".modal-types");
  const modalExp = document.querySelector(".modal-exp");
  const modalAbilities = document.querySelector(".modal-abilities");

  modalImage.src = pokemon.imageUrl;
  modalName.textContent = pokemon.name.toUpperCase();
  modalWeight.textContent = pokemon.desc;
  modalTypes.textContent = pokemon.types.join(", ");
  modalExp.textContent = pokemon.exp;

  // Clear existing abilities
  modalAbilities.innerHTML = "";

  // Add abilities
  pokemon.abilities.forEach((ability) => {
    const capitalizedAbilityName =
      ability.name.charAt(0).toUpperCase() + ability.name.slice(1);
    const abilityName = document.createElement("strong");
    abilityName.textContent = capitalizedAbilityName;
    const abilityEffect = document.createElement("span");
    abilityEffect.textContent = ability.effect;

    const abilityContainer = document.createElement("p");
    abilityContainer.appendChild(abilityName);
    abilityContainer.appendChild(document.createTextNode(": "));
    abilityContainer.appendChild(abilityEffect);

    modalAbilities.appendChild(abilityContainer);
  });

  modal.style.display = "block";

  // Close modal event listener
  const closeBtn = document.querySelector(".close");
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  // Close modal when clicking outside
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
}

GetPokemons();
