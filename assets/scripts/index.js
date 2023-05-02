// Función para crear la card
const createCard = (digimon) => {
  const { name, img, level } = digimon;
  const levelMapping = {
    Fresh: 1,
    'In Training': 2,
    Rookie: 3,
    Champion: 4,
    Ultimate: 5,
    Mega: 6,
  };
  const currentLevel = levelMapping[level];

  const card = document.createElement('div');
  card.classList.add('card');

  const nameElement = document.createElement('h3');
  nameElement.textContent = name;
  card.appendChild(nameElement);

  const imgElement = document.createElement('img');
  imgElement.src = img;
  imgElement.alt = name;
  card.appendChild(imgElement);

  const levelContent = document.createElement('div');
  levelContent.classList.add('level-content');

  const preLevel = document.createElement('span');
  preLevel.classList.add('text');
  preLevel.textContent = 'LV ';
  levelContent.appendChild(preLevel);

  const levelElement = document.createElement('p');
  levelElement.classList.add('title');
  levelElement.textContent = level;
  levelContent.appendChild(levelElement);

  card.appendChild(levelContent);

  const powerBars = document.createElement('div');
  powerBars.classList.add('power-bars');

  for (let i = 1; i <= 6; i++) {
    const bar = document.createElement('div');
    bar.classList.add('power-bar');

    if (i <= currentLevel) {
      bar.classList.add('active');
    }

    powerBars.appendChild(bar);
  }

  card.appendChild(powerBars);

  return card;
};

// Función para crear la tarjeta "No encontrado"
const createNoResultsCard = () => {
  const card = document.createElement('div');
  card.classList.add('not-found');

  const cardBody = document.createElement('div');
  cardBody.classList.add('not-found-body');
  card.appendChild(cardBody);

  const title = document.createElement('h5');
  title.classList.add('title');
  title.textContent = 'No encontrado';
  cardBody.appendChild(title);

  const text = document.createElement('p');
  text.classList.add('text');
  text.textContent = 'Pruebe otra búsqueda.';
  cardBody.appendChild(text);

  return card;
};

// Función para crear el elemento paginador
const createPaginatorElement = () => {
  const paginator = document.createElement('div');
  const paginatorControls = document.createElement('div');
  paginatorControls.classList.add('paginator-controls');

  const prevButton = document.createElement('button');
  prevButton.classList.add('btn', 'btn-outliner');
  prevButton.textContent = 'Prev';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updatePaginator();
      renderCards();
    }
  });

  paginatorControls.appendChild(prevButton);

  const nextButton = document.createElement('button');
  nextButton.classList.add('btn', 'btn-outliner');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;

  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      updatePaginator();
      renderCards();
    }
  });

  paginatorControls.appendChild(nextButton);
  paginator.appendChild(paginatorControls);

  const paginatorLabel = document.createElement('p');
  paginatorLabel.classList.add('paginator-label');

  const { startRange, endRange } = getPaginationRange();

  paginatorLabel.textContent = `Viendo ${startRange} - ${endRange}`;

  paginator.appendChild(paginatorLabel);

  return paginator;
};

// Función para obtener el rango de paginación actual
const getPaginationRange = () => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, digimonData.length);

  return { startRange: startIndex + 1, endRange: endIndex };
};

// Función para actualizar el paginador
const updatePaginator = () => {
  const paginatorTop = document.getElementById('paginator-top');
  const paginatorBottom = document.getElementById('paginator-bottom');

  paginatorTop.innerHTML = '';
  paginatorBottom.innerHTML = '';

  if (totalPages > 1) {
    const paginatorElementTop = createPaginatorElement();
    const paginatorElementBottom = createPaginatorElement();

    paginatorTop.appendChild(paginatorElementTop);
    paginatorBottom.appendChild(paginatorElementBottom);
  }
};

// Función para agregar las cards al DOM
const renderCards = () => {
  const container = document.getElementById('cards-container');
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  if (Array.isArray(digimonData) && digimonData.length > 0) {
    const { startRange, endRange } = getPaginationRange();

    digimonData.slice(startRange - 1, endRange).forEach((digimon) => {
      const card = createCard(digimon);
      container.appendChild(card);
    });
  } else {
    const noResultsCard = createNoResultsCard();
    container.appendChild(noResultsCard);
  }
};

// Función para buscar Digimon
const searchDigimon = (searchTerm) => {
  searchTerm = searchTerm.trim().toLowerCase();

  const options = { method: 'GET' };

  const fetchByName = () => {
    return fetch(
      `https://digimon-api.vercel.app/api/digimon/name/${searchTerm}`,
      options
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.hasOwnProperty('ErrorMsg')) {
          return fetchByLevel(searchTerm);
        } else {
          return data;
        }
      });
  };

  const fetchByLevel = (levelName) => {
    return fetch(
      `https://digimon-api.vercel.app/api/digimon/level/${levelName}`,
      options
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          return [];
        } else {
          return data;
        }
      });
  };

  fetchByName()
    .then((data) => {
      digimonData = data;
      totalPages = Math.ceil(data.length / itemsPerPage);
      currentPage = 1;

      updatePaginator();
      renderCards();
    })
    .catch((err) => console.error(err));
};

// Función para manejar la búsqueda de Digimon
const handleSearch = (event) => {
  const searchInput = document.getElementById('search-input');
  const searchTerm = searchInput.value;

  searchDigimon(searchTerm);

  searchInput.value = ''; // Limpia el campo de entrada
};

// Función para cargar todos los datos y generar las cards
const fetchAllDigimon = () => {
  currentPage = 1;

  fetchData();
};

// Función para cargar los datos
const fetchData = () => {
  const options = { method: 'GET' };

  fetch('https://digimon-api.vercel.app/api/digimon', options)
    .then((response) => response.json())
    .then((data) => {
      digimonData = data;
      totalPages = Math.ceil(data.length / itemsPerPage);

      updatePaginator();
      renderCards();
    })
    .catch((err) => console.error(err));
};

// Constantes
const itemsPerPage = 25;

// Variables globales
let currentPage = 1;
let totalPages;
let digimonData;

// Asignar eventos
document
  .getElementById('search-button')
  .addEventListener('click', handleSearch);

document.getElementById('search-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const searchTerm = event.target.value;

    searchDigimon(searchTerm);

    event.target.value = '';
  }
});

document
  .getElementById('show-all-button')
  .addEventListener('click', fetchAllDigimon);

// Llamada a la función para cargar los datos al cargar la página
fetchData();
