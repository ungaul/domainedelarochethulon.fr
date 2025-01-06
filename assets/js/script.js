$(document).ready(function () {
    function normalizeKey(key) {
        return key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim();
    }

    function createVinElement(key, data) {
        return `
            <div class="vin-item" data-vin="${key}">
                <img src="/assets/images/bouteilles/Bouteille ${key}.jpg" alt="${data.vintage} ${key}">
                <div>
                    <h2>${key} ${data.vintage}</h2>
                    <p>${data.description}</p>
                    <p><strong>Prix: </strong>
                        <span class="prix">${data.price.toFixed(2)}</span>€ TTC
                    </p>
                    <p><strong class="temp">Température de service:</strong> ${data.servingTemp}</p>
                </div>
            </div>
        `;
    }

    function createMedalElement(medal) {
        return `
            <div class="medal-item">
                <img src="${medal.imageUrl}" alt="Médaille ${medal.medal}">
                <p><strong>${medal.medal}</strong> pour <em>${medal.wine}</em></p>
            </div>
        `;
    }

    function showVinByKey(vinKey) {
        const normalizedKey = normalizeKey(vinKey);
        $('.vin-item').hide();
        const targetVin = $(`.vin-item[data-vin="${vinKey}"]`);
        if (targetVin.length > 0) {
            targetVin.show();
        }
    }

    function setURL(section, vinKey = null) {
        const params = new URLSearchParams();
        params.set('section', section);
        if (vinKey) {
            params.set('vin', vinKey);
        }
        history.pushState({}, '', `?${params.toString()}`);
    }

    function loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const section = params.get('section') || 'accueil';
        const vinKey = params.get('vin');

        $('.content-section').hide();
        $(`#${section}`).show();

        if (section === 'vins' && vinKey) {
            showVinByKey(vinKey);
        } else if (section === 'vins') {
            showVinByKey(defaultVin);
        }
    }

    function adjustLayout() {
        if ($(window).width() < 1000) {
            $('.content-section').show();
        } else {
            loadFromURL();
        }
    }

    $('.link').click(function (e) {
        if ($(window).width() >= 1000) {
            e.preventDefault();
            const target = $(this).attr('href').replace('#', '');
            setURL(target);
            $('.content-section').hide();
            $(`#${target}`).show();
        }
    });

    function updateContent() {
        $.ajax({
            url: "/assets/js/data.json",
            method: "GET",
            dataType: "json",
            success: function (data) {

                if (data.staticContent) {
                    $('#accueil-content').html(data.staticContent.accueil);
                    $('#exploitation-content').html(data.staticContent.exploitation);
                }

                if (data.wines) {
                    const vinListContainer = $('.vins-list');
                    const vinContentContainer = $('#vins-content');

                    vinListContainer.empty();
                    vinContentContainer.empty();

                    Object.keys(data.wines).forEach(vinKey => {

                        // Génération des étiquettes
                        const vinElement = `
                            <div style="background:url('/assets/images/etiquettes/min/Etiquette ${vinKey}.jpg')" data-vin="${vinKey}">
                            </div>
                        `;
                        vinListContainer.append(vinElement);

                        // Génération des détails des vins
                        const vinDetails = data.wines[vinKey];
                        const vinContent = `
                            <div class="vin-item" data-vin="${vinKey}">
                                <img src="/assets/images/bouteilles/Bouteille ${vinKey}.jpg" alt="${vinDetails.vintage} ${vinKey}">
                                <div>
                                    <h2>${vinKey} ${vinDetails.vintage}</h2>
                                    <p>${vinDetails.description}</p>
                                    <p><strong>Prix: </strong><span class="prix">${vinDetails.price.toFixed(2)}</span>€ TTC</p>
                                    <p><strong class="temp">Température de service:</strong> ${vinDetails.servingTemp}</p>
                                </div>
                            </div>
                        `;
                        vinContentContainer.append(vinContent);
                    });

                    // Ajouter un clic dynamique pour chaque vin dans la liste
                    vinListContainer.children('div').click(function () {
                        const vinKey = $(this).data('vin');
                        setURL('vins', vinKey);
                        $('.vin-item').hide(); // Masquer tous les vins
                        $(`.vin-item[data-vin="${vinKey}"]`).show(); // Afficher uniquement le vin sélectionné
                    });
                }

                if (data.accueil) {
                    const accueilContainer = $('#accueil-content');
                    accueilContainer.empty();
                    const accueilHTML = `
                        <p>${data.accueil.text}</p>
                        <p>${data.accueil.subText}</p>
                    `;
                    accueilContainer.append(accueilHTML);
                }

                if (data.news) {
                    const newsContainer = $('#actualites-content');
                    newsContainer.empty();
                    data.news.forEach(news => {
                        const newsItem = `
                            <div class="news-item">
                                <img src="${news.imageUrl}" alt="Actualité Image">
                                <p>${news.wine}</p>
                            </div>
                        `;
                        newsContainer.append(newsItem);
                    });
                }

                if (data.salons) {
                    const salonsContainer = $('#salons-content');
                    salonsContainer.empty();
                    salonsContainer.append("<p>Nous allons à votre rencontre en participant à des salons des vins, où nous vous accueillerons toujours chaleureusement. N'hésitez pas à venir accompagnés de votre famille et de vos amis.</p>");
                    data.salons.forEach(salon => {
                        const salonItem = `
                            <div class="salon-item">
                                <p><strong>${salon.location}</strong></p>
                                <p><strong>Édition:</strong> ${salon.edition}</p>
                                <p><strong>Date:</strong> ${salon.date}</p>
                            </div>
                        `;
                        salonsContainer.append(salonItem);
                    });
                }

                if (data.medals) {
                    const medalsContainer = $('#medals-content');
                    medalsContainer.empty();
                    data.medals.forEach(medal => {
                        const medalElement = createMedalElement(medal);
                        medalsContainer.append(medalElement);
                    });
                }
            },
            error: function (error) {
                console.error("Error loading JSON:", error);
            }
        });
    }

    function updateLastUpdate() {
        const lastUpdateElement = $('#lastUpdate');
        lastUpdateElement.text('Calcul...');

        const repoUrl = 'https://api.github.com/repos/ungaul/domainedelarochethulon.fr';
        fetch(repoUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const lastUpdate = new Date(data.updated_at);
                lastUpdateElement.text(lastUpdate.toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                }));
            })
            .catch(error => {
                console.error('Erreur en récupérant la dernière mise à jour :', error);
                lastUpdateElement.text('Erreur');
            });
    }

    $(window).resize(adjustLayout);
    window.addEventListener('popstate', loadFromURL);

    updateContent();
    updateLastUpdate();
    loadFromURL();
});
