$(document).ready(function () {
    let currentVinIndex = 0;
    const vins = $('.vin-item');
    const totalVins = vins.length;

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

    function adjustLayout() {
        if ($(window).width() < 1000) {
            $('.content-section').show();
        } else {
            $('.content-section').hide();
            $('#accueil').show();
        }
    }

    $(window).resize(adjustLayout);
    adjustLayout();
    showVin(currentVinIndex);

    $('.link').click(function (e) {
        if ($(window).width() >= 1000) {
            e.preventDefault();
            const target = $(this).attr('href');
            $('.content-section').hide();
            $(target).show();
        }
    });

    function normalizeKey(key) {
        return key
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9 ]/g, "")
            .trim();
    }

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
                    data.salons.forEach(salon => {
                        const salonItem = `
                            <div class="salon-item">
                                <p><strong>Lieu:</strong> ${salon.location}</p>
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
    updateContent();
});
