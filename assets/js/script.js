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

    function updatePrices() {
        $.ajax({
            url: "data.json",
            method: "GET",
            dataType: "json",
            success: function (data) {
                if (data) {
                    // Met à jour les prix dans le DOM
                    $('.vin-item').each(function () {
                        const vinName = $(this).find('h2').text().trim();
                        if (data[vinName]) {
                            const priceElement = $(this).find('p[class$="-prix"]');
                            priceElement.text(data[vinName].toFixed(2));
                        }
                    });
                }
            },
            error: function (error) {
                console.error("Erreur lors du chargement du JSON : ", error);
            }
        });
    }

    updatePrices();
});
