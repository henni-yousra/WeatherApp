const elements = {
    button: document.getElementById('showWeatherBtn'),
    input: document.getElementById('cityInput'),
    todayForecast: document.getElementById('today-forecast'),
    nextDaysForecast: document.querySelector('.next-days-forecast')
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
        city ? fetchWeatherData(city) : displayError("Impossible de trouver la ville à partir des coordonnées.");
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
    city ? fetchWeatherData(city) : displayError("Veuillez entrer un nom de ville.");
}

function handleKeyPress(event) {
    if (event.key === 'Enter') handleButtonClick();
}

function getInputValue() {
    return elements.input.value.trim();
}

async function fetchWeatherData(city) {
    const url = `https://www.prevision-meteo.ch/services/json/${city}`;
    displayLoading();

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erreur : ${response.status}`);

        const data = await response.json();
        if (data.errors) throw new Error("Ville non trouvée.");

        displayWeatherData(data);
    } catch (error) {
        displayError(error.message);
    }
}

function displayWeatherData(data) {
    const { name, sunrise, sunset } = data.city_info;
    const current = data.current_condition;

    elements.todayForecast.innerHTML = '';
    elements.nextDaysForecast.innerHTML = '';

    const todayForecast = document.createElement('div');
    todayForecast.classList.add('today-forecast');
    todayForecast.innerHTML = `
        <h2>Aujourd'hui à ${name}  </h2> <strong> 
        <h3>${data.fcst_day_0.day_short} ${data.fcst_day_0.date}</h3>
        <p><strong>Température actuelle :</strong> ${current.tmp}°C</p>
        <p><strong>Max :</strong> ${data.fcst_day_0.tmax}°C / <strong>Min :</strong> ${data.fcst_day_0.tmin}°C</p>
        <p><strong>Vent :</strong> ${current.wnd_spd} km/h</p>
        <p><strong>Humidité :</strong> ${current.humidity}%</p>
        <p><strong>Pression :</strong> ${current.pressure} mb</p>
        <img src="${data.fcst_day_0.icon_big}" alt="${data.fcst_day_0.condition}" width="80" height="80">
        <p>${data.fcst_day_0.condition}  </p> </strong>
    `;
    elements.todayForecast.appendChild(todayForecast);

    data.fcst_day_1 && elements.nextDaysForecast.appendChild(renderDailyForecast(data.fcst_day_1));
    data.fcst_day_2 && elements.nextDaysForecast.appendChild(renderDailyForecast(data.fcst_day_2));
    data.fcst_day_3 && elements.nextDaysForecast.appendChild(renderDailyForecast(data.fcst_day_3));
    data.fcst_day_4 && elements.nextDaysForecast.appendChild(renderDailyForecast(data.fcst_day_4));
}

function renderDailyForecast(dayData) {
    const forecastDiv = document.createElement('div');
    forecastDiv.classList.add('small-day-forecast');
    forecastDiv.innerHTML = `
        <h3>${dayData.day_short} ${dayData.date}</h3>
        <strong>
        <img src="${dayData.icon}" alt="${dayData.condition}" width="50" height="50">
        <p>${dayData.condition}</p> </strong>
        <p><strong>Max :</strong> ${dayData.tmax}°C / <strong>Min :</strong> ${dayData.tmin}°C</p>
    `;
    return forecastDiv;
}

function displayLoading() {
    elements.todayForecast.innerHTML = `<p class="loading">Chargement...</p>`;
}

function displayError(message) {
    elements.todayForecast.innerHTML = `<p class="error">${message}</p>`;
}

init();
