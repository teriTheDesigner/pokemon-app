"use strict";
window.addEventListener("DOMContentLoaded", start);

let allPokemons = [];

const Pokemon = {
  name: "",
  image: "",
  weight: 0,
  exp: 0,
  types: [],
  abilities: [],
};

function start() {
  console.log("ready");

  //TO DO : Add event listeners to filter and sort buttons

  GetPokemons();
}

// fetch all pokemons
async function GetPokemons() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=200");
  const data = await response.json();
  console.log("all pokemons in get pokemons", data);
  // when loaded, prepare data objects
  PreparAllPokemons(data);
}

// prepare all Pokemons array
async function PreparAllPokemons(data) {
  allPokemons = await Promise.all(
    data.results.map((pokemonItem) => PrepareObject(pokemonItem))
  );
  console.log("all pokemons in PREPARE objects", allPokemons);
  // TO DO : this might not be the function to call first
  DisplayPokemonCards(allPokemons);
}

// Prepare pokemon object
async function PrepareObject(pokemonItem) {
  const res = await fetch(pokemonItem.url);
  const pokemonDetails = await res.json();
  const typeNames = pokemonDetails.types.map((type) => type.type.name);
  const abilityPromises = pokemonDetails.abilities.map(async (ability) => {
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

  //create object for each pokemon based on the Object Prototype
  const pokemon = Object.create(Pokemon);
  pokemon.name = pokemonItem.name;
  pokemon.image =
    pokemonDetails.sprites.other["official-artwork"].front_default;
  pokemon.weight = pokemonDetails.weight;
  pokemon.exp = pokemonDetails.base_experience;
  pokemon.types = typeNames;
  pokemon.abilities = abilities;
  return pokemon;
}

// Display List of pokemons
function DisplayPokemonCards(allPokemons) {
  const pokemonCardsContainer = document.querySelector(".all-pokemon-cards");
  const template = document.querySelector("#pokemon-card-template");

  allPokemons.forEach((pokemon) => {
    const clone = template.content.cloneNode(true);

    clone.querySelector("img").src = pokemon.image; // Changed pokemon.imageUrl to pokemon.image
    clone.querySelector(".name").textContent = pokemon.name.toUpperCase();
    clone.querySelector(".weight").textContent = `${pokemon.weight} kg`; // Changed pokemon.desc to pokemon.weight
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

  modalImage.src = pokemon.image;
  modalName.textContent = pokemon.name.toUpperCase();
  modalWeight.textContent = pokemon.weight;
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
