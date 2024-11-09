const elements = {
    button: document.getElementById('showWeatherBtn'),
    input: document.getElementById('cityInput'),
    dataDiv: document.getElementById('data')
};

function init() {
    elements.button.addEventListener('click', handleButtonClick);
    elements.input.addEventListener('keypress', handleKeyPress);
    fetchWeatherData("Bordeaux");
}

const map = L.map('map').setView([44.8378, -0.5792], 10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

map.on('click', async (event) => {
    const { lat, lng } = event.latlng;
    try {
        const city = await getCityFromCoordinates(lat, lng);
        if (city) {
            fetchWeatherData(city);
        } else {
            displayError("Impossible de trouver la ville à partir des coordonnées.");
        }
    } catch (error) {
        displayError("Erreur lors de la récupération de la ville.");
    }
});

async function getCityFromCoordinates(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur de récupération des données.");
        
        const data = await response.json();
        return data.address.city || data.address.town || data.address.village || null;
    } catch (error) {
        console.error("Erreur avec Nominatim:", error);
        return null;
    }
}

function handleButtonClick() {
    const city = getInputValue();
    if (city) {
        fetchWeatherData(city);
    } else {
        displayError("Veuillez entrer un nom de ville.");
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        handleButtonClick();
    }
}

function getInputValue() {
    return elements.input.value.trim();
}

async function fetchWeatherData(city) {
    const url = `https://www.prevision-meteo.ch/services/json/${city}`;
    displayLoading();

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur : ${response.status}`);
        }
        const data = await response.json();

        if (data.errors) {
            throw new Error("Ville non trouvée.");
        }
        
        displayWeatherData(data);
    } catch (error) {
        displayError(error.message);
    }
}

function displayLoading() {
    elements.dataDiv.innerHTML = `<p class="loading">Chargement...</p>`;
}

function displayError(message) {
    elements.dataDiv.innerHTML = `<p class="error">${message}</p>`;
}

function displayWeatherData(data) {
    elements.dataDiv.innerHTML = `
        <h2>Météo pour ${data.city_info.name}</h2>
        <p>Température actuelle : ${data.current_condition.tmp}°C</p>
        <p>Conditions : ${data.current_condition.condition}</p>
        <p>Humidité : ${data.current_condition.humidity}%</p>
        <img src="${data.current_condition.icon}" alt="Icône météo">
    `;
}

init();
