const elements = {
    bouton: document.getElementById('boutonMeteo'),
    saisie: document.getElementById('saisieVille'),
    previsionAujourdhui: document.getElementById('previsionAujourdhui'),
    previsionJoursSuivants: document.querySelector('.previsionJoursSuivants')
};

function initialiser() {
    elements.bouton.addEventListener('click', gererClicBouton);
    elements.saisie.addEventListener('keypress', (evenement) => {
        if (evenement.key === 'Enter') gererClicBouton();
    });
    obtenirDonneesMeteo("Bordeaux");
}

const carte = L.map('carte').setView([44.8378, -0.5792], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(carte);

carte.on('click', async ({ latlng: { lat, lng } }) => {
    try {
        const ville = await obtenirVilleDepuisCoordonnees(lat, lng);
        ville ? obtenirDonneesMeteo(ville) : afficherErreur("Impossible de trouver la ville.");
    } catch (erreur) {
        afficherErreur("Erreur lors de la récupération de la ville.");
    }
});

async function obtenirVilleDepuisCoordonnees(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    try {
        const reponse = await fetch(url);
        if (!reponse.ok) throw new Error("Erreur de récupération des données.");
        
        const { address } = await reponse.json();
        return address.city || address.town || address.village || null;
    } catch (erreur) {
        console.error("Erreur avec Nominatim:", erreur);
        return null;
    }
}

function gererClicBouton() {
    const ville = elements.saisie.value.trim();
    if (ville) {
        obtenirCoordonneesVille(ville)
            .then(coordonnees => {
                if (coordonnees) {
                    carte.setView(coordonnees, 10); 
                    obtenirDonneesMeteo(ville);
                } else {
                    afficherErreur("Ville non trouvée.");
                }
            })
            .catch(() => afficherErreur("Erreur lors de la récupération des coordonnées."));
    } else {
        afficherErreur("Veuillez entrer un nom de ville.");
    }
}

async function obtenirCoordonneesVille(ville) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${ville}&limit=1`;
    try {
        const reponse = await fetch(url);
        if (!reponse.ok) throw new Error("Erreur de récupération des données.");

        const [data] = await reponse.json();
        return data ? { lat: parseFloat(data.lat), lng: parseFloat(data.lon) } : null;
    } catch (erreur) {
        console.error("Erreur avec Nominatim:", erreur);
        return null;
    }
}


async function obtenirDonneesMeteo(ville) {
    const url = `https://www.prevision-meteo.ch/services/json/${ville}`;
    afficherChargement();

    try {
        const reponse = await fetch(url);
        if (!reponse.ok) throw new Error(`Erreur : ${reponse.status}`);

        const donnees = await reponse.json();
        if (donnees.errors) throw new Error("Ville non trouvée.");

        afficherDonneesMeteo(donnees);
    } catch (erreur) {
        afficherErreur(erreur.message);
    }
}

function afficherDonneesMeteo(donnees) {
    const { name } = donnees.city_info;
    const { tmp, wnd_spd, humidity } = donnees.current_condition;
    const { tmax, tmin, icon_big, condition } = donnees.fcst_day_0;

    elements.previsionAujourdhui.innerHTML = `
        <div class="previsionAujourdhui">
            <h2>${name}</h2>
            <p><strong>A l'instant :</strong> ${tmp}°C</p>
            <p><strong>Max :</strong> ${tmax}°C / <strong>Min :</strong> ${tmin}°C</p>
            <p><strong>Vent :</strong> ${wnd_spd} km/h</p>
            <p><strong>Humidité :</strong> ${humidity}%</p>
            <img src="${icon_big}" alt="${condition}" width="80" height="80">
            <p>${condition}</p>
        </div>
    `;

    elements.previsionJoursSuivants.innerHTML = donnees.fcst_day_1 ? renderiserPrevisionsSuivantes([donnees.fcst_day_0, donnees.fcst_day_1, donnees.fcst_day_2, donnees.fcst_day_3, donnees.fcst_day_4]) : '';
}

function renderiserPrevisionsSuivantes(previsions) {
    return previsions.map(({ day_short, date, icon, condition, tmax, tmin }) => `
        <div class="petitePrevisionJour">
            <h3>${day_short} ${date}</h3>
            <img src="${icon}" alt="${condition}" width="50" height="50">
            <p>${condition}</p>
            <p><strong>Max :</strong> ${tmax}°C / <strong>Min :</strong> ${tmin}°C</p>
        </div>
    `).join('');
}

function afficherChargement() {
    elements.previsionAujourdhui.innerHTML = `<p class="chargement">Chargement...</p>`;
}

function afficherErreur(message) {
    elements.previsionAujourdhui.innerHTML = `<p class="erreur">${message}</p>`;
}

initialiser();
