"use strict";
window.addEventListener("DOMContentLoaded", start);

let AllPokemons = [];
let FavoritePokemons = [];
let isFavoriteFilterActive = false;

const Pokemon = {
  name: "",
  image: "",
  weight: 0,
  exp: 0,
  types: [],
  abilities: [],
  favorite: false,
};

function start() {
  console.log("start");
  RegisterButtons();
  GetPokemons();
}

function AddToFavorite(pokemon) {
  console.log("AddToFavorite");
  const index = FavoritePokemons.findIndex((p) => p.name === pokemon.name);
  pokemon.favorite = !pokemon.favorite;
  if (pokemon.favorite) {
    FavoritePokemons.unshift(pokemon);
  } else {
    FavoritePokemons.splice(index, 1);
  }

  if (isFavoriteFilterActive) {
    filterList("favorite");
  }
  updateHeartIcon(pokemon);
}

function updateHeartIcon(pokemon) {
  const allPokemonCards = document.querySelectorAll(".pokemon-card");
  allPokemonCards.forEach((card) => {
    if (card.pokemon === pokemon) {
      const heartIcon = card.querySelector(".favoriteHeart");
      if (heartIcon) {
        heartIcon.textContent = pokemon.favorite ? "❤️" : "♡";
      }
    }
  });
}

function RegisterButtons() {
  console.log("RegisterButtons");
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", SelectFilter));
  document
    .querySelectorAll("[data-action='sort']")
    .forEach((button) => button.addEventListener("click", SelectSort));
}

function SelectFilter(event) {
  console.log("SelectFilter");
  const filter = event.target.dataset.filter;

  isFavoriteFilterActive = filter === "favorite";

  filterList(filter);
}

function SelectSort(event) {
  console.log("SelectSort");
  const sortBy = event.target.dataset.sort;
  console.log("SelectSort", sortBy);
  SortList(sortBy);
}

//fetch all pokemons
async function GetPokemons() {
  console.log("GetPokemons");
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=200");
  const data = await response.json();

  // when loaded, prepare data objects
  PreparAllPokemons(data);
}

// prepare all Pokemons array
async function PreparAllPokemons(data) {
  console.log("PreparAllPokemons");
  AllPokemons = await Promise.all(
    data.results.map((pokemonItem) => PrepareObject(pokemonItem))
  );

  DisplayPokemonList(AllPokemons);
}

// Prepare pokemon object
async function PrepareObject(pokemonItem) {
  console.log("PrepareObject");
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

function filterList(filter) {
  console.log("filterList");
  let filteredList = AllPokemons;
  if (filter === "*") {
    filteredList = AllPokemons;
  } else if (filter === "favorite") {
    filteredList = FavoritePokemons;
  } else if (filter) {
    filteredList = AllPokemons.filter((pokemon) => isThisType(pokemon, filter));
  }
  console.log(filteredList);

  DisplayPokemonList(filteredList);
}

function isThisType(pokemon, filter) {
  console.log("isThisType");
  return pokemon.types.includes(filter);
}

function SortList(sortBy) {
  let sortedList = AllPokemons;
  if (sortBy === "nameUp") {
    sortedList = sortedList.sort(SortByNameUp);
  }
  if (sortBy === "nameDown") {
    sortedList = sortedList.sort(SortByNameDown);
  }
  if (sortBy === "XPDown") {
    sortedList = sortedList.sort(SortByXPDown);
  }
  if (sortBy === "XPUp") {
    sortedList = sortedList.sort(SortByXPUp);
  }
  if (sortBy === "weightDown") {
    sortedList = sortedList.sort(SortByWeightDown);
  }
  if (sortBy === "weightUp") {
    sortedList = sortedList.sort(SortByWeightUp);
  }

  DisplayPokemonList(sortedList);
}

function SortByNameUp(pokemon1, pokemon2) {
  if (pokemon1.name < pokemon2.name) {
    return -1;
  } else {
    return 1;
  }
}
function SortByNameDown(pokemon1, pokemon2) {
  if (pokemon1.name < pokemon2.name) {
    return 1;
  } else {
    return -1;
  }
}

function SortByXPUp(pokemon1, pokemon2) {
  if (pokemon1.exp < pokemon2.exp) {
    return -1;
  } else {
    return 1;
  }
}
function SortByXPDown(pokemon1, pokemon2) {
  if (pokemon1.exp < pokemon2.exp) {
    return 1;
  } else {
    return -1;
  }
}

function SortByWeightUp(pokemon1, pokemon2) {
  if (pokemon1.weight < pokemon2.weight) {
    return -1;
  } else {
    return 1;
  }
}

function SortByWeightDown(pokemon1, pokemon2) {
  if (pokemon1.weight < pokemon2.weight) {
    return 1;
  } else {
    return -1;
  }
}

function DisplayPokemonList(allPokemons) {
  console.log("DisplayPokemonList");
  const pokemonCardsContainer = document.querySelector(".all-pokemon-cards");
  pokemonCardsContainer.innerHTML = "";
  const template = document.querySelector("#pokemon-card-template");

  allPokemons.forEach((pokemon) => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector(".pokemon-card");

    clone.querySelector("img").src = pokemon.image;
    clone.querySelector(".name").textContent = pokemon.name.toUpperCase();
    clone.querySelector(".weight").textContent = `${pokemon.weight} kg`;
    clone.querySelector(".types").textContent = pokemon.types.join(", ");
    clone.querySelector(".exp").textContent = pokemon.exp;

    const heartIcon = clone.querySelector(".favoriteHeart");
    if (heartIcon) {
      heartIcon.textContent = pokemon.favorite ? "❤️" : "♡";
    }
    // Store reference to Pokemon object on card element
    card.pokemon = pokemon;

    // Modify the event listener to open the modal only if not clicking on the heart icon
    clone.querySelector(".favoriteHeart").addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent click event from bubbling up to the card
      AddToFavorite(pokemon);
    });

    // Open modal when clicking on the card
    clone.querySelector(".pokemon-card").addEventListener("click", () => {
      displayModal(pokemon);
    });

    pokemonCardsContainer.appendChild(clone);
  });
}

// Display modal function
function displayModal(pokemon) {
  console.log("DisplayModal");
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
