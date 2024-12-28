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
            $('#accueil').show();
        }
    }

    $(window).resize(adjustLayout);

    adjustLayout();

    showVin(currentVinIndex);

    function normalizeKey(key) {
        return key
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    function updatePrices() {
        $.ajax({
            url: "/assets/js/data.json",
            method: "GET",
            dataType: "json",
            success: function (data) {
                console.log("JSON data loaded:", data);
                if (data) {
                    $('.vin-item').each(function () {
                        const vinTitle = $(this).find('h2').text().trim();
                        const normalizedTitle = normalizeKey(vinTitle);
                        console.log("Checking vinTitle:", vinTitle, "Normalized:", normalizedTitle);

                        for (const [key, value] of Object.entries(data)) {
                            const normalizedKey = normalizeKey(key);
                            console.log("Comparing JSON key:", key, "Normalized:", normalizedKey);

                            if (normalizedKey === normalizedTitle) {
                                const priceElement = $(this).find('p[class$="-prix"]');
                                console.log("Match found for:", vinTitle, "Price:", value);
                                priceElement.text(value.toFixed(2));
                                break;
                            }
                        }
                    });
                }
            },
            error: function (error) {
                console.error("Error loading JSON:", error);
            }
        });
    }

    updatePrices();
});
