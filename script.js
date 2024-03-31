"use strict";
window.addEventListener("DOMContentLoaded", start);

let AllPokemons = [];
let FavoritePokemons = [];

const Pokemon = {
  name: "",
  image: "",
  weight: 0,
  exp: 0,
  types: [],
  abilities: [],
};

function start() {
  RegisterButtons();
  GetPokemons();
}

function AddToFavorite(pokemon) {
  console.log("Favorite Pokemons", pokemon);
  const index = FavoritePokemons.findIndex((p) => p.name === pokemon.name);
  const pokemonCard = document.querySelector(
    `.pokemon-card[data-name="${pokemon.name}"]`
  );
  if (index === -1) {
    FavoritePokemons.push(pokemon);
    // Set heart icon text content to ❤️
    if (pokemonCard) {
      const heartIcon = pokemonCard.querySelector(".favoriteHeart");
      if (heartIcon) {
        heartIcon.textContent = "❤️";
      }
    }
  } else {
    FavoritePokemons.splice(index, 1);
    // Set heart icon text content back to "favorite"
    if (pokemonCard) {
      const heartIcon = pokemonCard.querySelector(".favoriteHeart");
      if (heartIcon) {
        heartIcon.textContent = "♡";
      }
    }
  }
  console.log("Favorite Pokemons:", FavoritePokemons);
}

function RegisterButtons() {
  document
    .querySelectorAll("[data-action='filter']")
    .forEach((button) => button.addEventListener("click", SelectFilter));
}

function SelectFilter(event) {
  const filter = event.target.dataset.filter;

  filterList(filter);
}

//fetch all pokemons
async function GetPokemons() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=200");
  const data = await response.json();

  // when loaded, prepare data objects
  PreparAllPokemons(data);
}

// prepare all Pokemons array
async function PreparAllPokemons(data) {
  AllPokemons = await Promise.all(
    data.results.map((pokemonItem) => PrepareObject(pokemonItem))
  );

  DisplayPokemonList(AllPokemons);
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

function filterList(filter) {
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
  return pokemon.types.includes(filter);
}

// Display List of pokemons
function DisplayPokemonList(allPokemons) {
  const pokemonCardsContainer = document.querySelector(".all-pokemon-cards");
  pokemonCardsContainer.innerHTML = "";
  const template = document.querySelector("#pokemon-card-template");

  allPokemons.forEach((pokemon) => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector(".pokemon-card");
    card.dataset.name = pokemon.name; // Set custom data attribute

    clone.querySelector("img").src = pokemon.image;
    clone.querySelector(".name").textContent = pokemon.name.toUpperCase();
    clone.querySelector(".weight").textContent = `${pokemon.weight} kg`;
    clone.querySelector(".types").textContent = pokemon.types.join(", ");
    clone.querySelector(".exp").textContent = pokemon.exp;

    const heartIcon = clone.querySelector(".favoriteHeart");
    if (heartIcon) {
      const index = FavoritePokemons.findIndex((p) => p.name === pokemon.name);
      heartIcon.textContent = index === -1 ? "♡" : "❤️"; // Update heart icon based on favorite status
    }

    // Modify the event listener to open the modal only if not clicking on the heart icon
    clone.querySelector(".pokemon-card").addEventListener("click", (event) => {
      if (!event.target.closest(".favoriteHeart")) {
        displayModal(pokemon);
      }
    });

    pokemonCardsContainer.appendChild(clone);
  });

  pokemonCardsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("favoriteHeart")) {
      const pokemonCard = event.target.closest(".pokemon-card");
      const pokemonName = pokemonCard.dataset.name;
      const pokemon = allPokemons.find((p) => p.name === pokemonName);
      if (pokemon) {
        AddToFavorite(pokemon);
      }
    }
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
