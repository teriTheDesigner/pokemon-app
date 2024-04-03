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

const settings = {
  filterBy: "*",
  sortBy: "",
  sortDir: "asc",
};

const typeIcons = {
  bug: "bug_report",
  dark: "dark_mode",
  dragon: "sentiment_extremely_dissatisfied",
  electric: "flash_on",
  fairy: "hotel_class",
  fighting: "sports_mma",
  fire: "local_fire_department",
  flying: "raven",
  ghost: "robot",
  grass: "eco",
  ground: "filter_hdr",
  ice: "ac_unit",
  normal: "circle",
  poison: "skull",
  psychic: "cognition",
  rock: "line_style",
  steel: "exercise",
  water: "water_drop",
};

function start() {
  RegisterButtons();
  GetPokemons();
  initializeAutocomplete();
}

// add or remove from favorite list
function AddToFavorite(pokemon) {
  const index = FavoritePokemons.findIndex((p) => p.name === pokemon.name);
  pokemon.favorite = !pokemon.favorite;
  if (pokemon.favorite) {
    FavoritePokemons.unshift(pokemon);
  } else {
    FavoritePokemons.splice(index, 1);
  }

  if (isFavoriteFilterActive) {
    // Filter the list and then update the UI with the filtered list
    const filteredList = filterList(AllPokemons);
    DisplayPokemonList(filteredList);
  }
  updateHeartIcon(pokemon);
}

// update Heart icon when adding / removing from favorite list
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

// Listen to events on filter and sort buttons
function RegisterButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((button) =>
    button.addEventListener("click", function (event) {
      SelectFilter(event);
      ChangeColor(event);
    })
  );

  document.querySelectorAll("[data-action='sort']").forEach((button) =>
    button.addEventListener("click", function (event) {
      SelectSort(event);
      ChangeColor(event);
    })
  );
}

// change color of clicked buttons
function ChangeColor(event) {
  if (event.target.dataset.action === "sort") {
    document.querySelectorAll(".sort").forEach((btn) => {
      btn.classList.remove("active");
    });
    event.target.classList.add("active");
  }

  if (event.target.dataset.action === "filter") {
    document.querySelectorAll(".type").forEach((btn) => {
      btn.classList.remove("active");
    });
    event.target.classList.add("active");
  }
}

// Get value of selected filter
function SelectFilter(event) {
  const filter = event.target.dataset.filter;

  isFavoriteFilterActive = filter === "favorite";

  SetFilter(filter);
}

// set filtering settings
function SetFilter(filter) {
  settings.filterBy = filter;

  BuildList();
}

// Get value of selected sorting criteria
function SelectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  SetSort(sortBy, sortDir);
}

// set sorting settings
function SetSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;

  BuildList();
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

// filter the list of pokemons
function filterList(filteredList) {
  if (settings.filterBy === "*") {
    filteredList = AllPokemons;
  } else if (settings.filterBy === "favorite") {
    filteredList = FavoritePokemons;
  } else if (settings.filterBy) {
    filteredList = AllPokemons.filter((pokemon) =>
      isThisType(pokemon, settings.filterBy)
    );
  }

  return filteredList;
}

// check the type of pokemon
function isThisType(pokemon, filter) {
  return pokemon.types.includes(filter);
}

// Sort the filtered list
function SortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(SortByProperty);

  function SortByProperty(pokemon1, pokemon2) {
    if (pokemon1[settings.sortBy] < pokemon2[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

// Build filtered and sorted list
function BuildList() {
  const currentList = filterList(AllPokemons);
  const sortedList = SortList(currentList);

  DisplayPokemonList(sortedList);
}

// Autocomplete Dropdown Search

function initializeAutocomplete() {
  const searchInput = document.getElementById("search");
  const autocomplete = document.querySelector(".autocomplete");

  searchInput.addEventListener("input", function () {
    const searchQuery = this.value.toLowerCase();
    const filteredPokemons = AllPokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchQuery)
    );
    displayAutocomplete(filteredPokemons);
    DisplayPokemonList(filteredPokemons);
  });

  // Close autocomplete when clicking outside only if it's visible
  window.addEventListener("click", function (event) {
    if (
      autocomplete.style.display !== "none" &&
      !event.target.closest(".autocomplete")
    ) {
      autocomplete.style.display = "none";
    }
  });

  function displayAutocomplete(pokemons) {
    autocomplete.innerHTML = "";
    pokemons.forEach((pokemon) => {
      const item = document.createElement("div");
      item.classList.add("autocomplete-item");
      item.textContent = pokemon.name;
      item.addEventListener("click", function () {
        searchInput.value = pokemon.name;
        autocomplete.innerHTML = "";
        DisplayPokemonList([pokemon]);
      });
      autocomplete.appendChild(item);
    });

    // Show autocomplete if there are items to display
    if (pokemons.length > 0) {
      autocomplete.style.display = "block";
    } else {
      autocomplete.style.display = "none";
    }
  }
}

// Display the list of pokemons
function DisplayPokemonList(allPokemons) {
  const pokemonCardsContainer = document.querySelector(".all-pokemon-cards");
  pokemonCardsContainer.innerHTML = "";
  const template = document.querySelector("#pokemon-card-template");

  allPokemons.forEach((pokemon) => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector(".pokemon-card");

    clone.querySelector("img").src = pokemon.image;
    clone.querySelector(".name").textContent = pokemon.name.toUpperCase();
    clone.querySelector(".weight").textContent = `${pokemon.weight} kg`;
    clone.querySelector(".exp").textContent = pokemon.exp;

    // Clear existing type icons
    const typesContainer = clone.querySelector(".types");
    typesContainer.innerHTML = "";

    // Add type icons
    pokemon.types.forEach((type) => {
      const typeSpan = document.createElement("span");
      typeSpan.className = "material-symbols-outlined";
      typeSpan.textContent = typeIcons[type.toLowerCase()];
      typesContainer.appendChild(typeSpan);
    });

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
