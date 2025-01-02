$(document).ready(function () {
    const vins = $('.vin-item');
    const vinsList = $('#vins-list div');
    const defaultVin = 'primeur';

    function normalizeKey(key) {
        return key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim();
    }

    function showVinByKey(vinKey) {
        const normalizedKey = normalizeKey(vinKey);
        vins.hide();
        const targetVin = vins.filter(function () {
            return normalizeKey($(this).data('vin')) === normalizedKey;
        });
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

    vinsList.click(function () {
        const vinKey = $(this).data('vin');
        setURL('vins', vinKey);
        $('.content-section').hide();
        $('#vins').show();
        showVinByKey(vinKey);
    });

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
                if (data.wines) {
                    $('.vin-item').each(function () {
                        const vinKey = normalizeKey($(this).data('vin'));
                        for (const [key, value] of Object.entries(data.wines)) {
                            if (vinKey === normalizeKey(key)) {
                                $(this).find('.prix').text(value.toFixed(2));
                                break;
                            }
                        }
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
                if (data.news) {
                    const newsContainer = $('#actualites-content');
                    newsContainer.empty();
                    data.news.forEach(news => {
                        const newsItem = `
                            <div class="news-item">
                                <img src="${news.image}" alt="Actualité Image">
                                <p>${news.description}</p>
                            </div>
                        `;
                        newsContainer.append(newsItem);
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
