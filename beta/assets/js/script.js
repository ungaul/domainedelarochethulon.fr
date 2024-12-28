$(document).ready(function () {
    let currentVinIndex = 0;
    const vins = $('.vin-item');
    const totalVins = vins.length;
    const contentSections = $('.content-section');
    const dataURL = "https://script.google.com/macros/s/AKfycbzzSDzFGYA3VNSCjz9sy5RBxju4nDroqG8gyejiAobJHz-LwXD-L-2KXV3v08Tfxi1D/exec";

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
            $('#accueil').show();
        }
    }

    $(window).resize(adjustLayout);

    adjustLayout();

    showVin(currentVinIndex);

    function updatePrices() {
        $.ajax({
            url: dataURL,
            method: "GET",
            dataType: "json",
            success: function (data) {
                if (data) {
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
                console.error("Erreur lors de la récupération des données : ", error);
            }
        });
    }

    updatePrices();
});
