$(document).ready(function () {
    let currentVinIndex = 0;
    const vins = $('.vin-item');
    const totalVins = vins.length;
    const contentSections = $('.content-section');

    function showVin(index) {
        vins.hide();
        $(vins[index]).show();
    }

    $('#prev-vin').click(function () {
        currentVinIndex = (currentVinIndex - 1 + totalVins) % totalVins;
        showVin(currentVinIndex);
    });

    $('#next-vin').click(function () {
        currentVinIndex = (currentVinIndex + 1) % totalVins;
        showVin(currentVinIndex);
    });

    $('.link').click(function (e) {
        if ($(window).width() >= 1000) {
            e.preventDefault();
            const target = $(this).attr('href');
            contentSections.hide();
            $(target).show();
        }
    });

    function adjustLayout() {
        if ($(window).width() < 1000) {
            contentSections.show();
        } else {
            contentSections.hide();
            $('#accueil').show(); // Show the first section by default
        }
    }

    $(window).resize(adjustLayout);

    adjustLayout(); // Initial check

    showVin(currentVinIndex);

    // Fonction pour mettre à jour les prix
    function updatePrices() {
        $.ajax({
            url: "/assets/js/data.json", // Chemin vers le fichier JSON
            method: "GET",
            dataType: "json",
            success: function (data) {
                if (data.Prix) {
                    // Met à jour les prix dans le DOM
                    const prices = data.Prix;
                    $('.vin-item').each(function () {
                        const vinClass = $(this).find('p[class$="-prix"]').attr('class'); // Récupère la classe CSS
                        const vinKey = vinClass.split('-prix')[0].replace('prix-', ''); // Extrait la clé
                        if (prices[vinKey]) {
                            $(this).find(`.${vinClass}`).text(prices[vinKey].toFixed(2)); // Met à jour le prix
                        }
                    });
                }
            },
            error: function (error) {
                console.error("Erreur lors du chargement du JSON : ", error);
            }
        });
    }

    // Charger les prix au démarrage
    updatePrices();
});
