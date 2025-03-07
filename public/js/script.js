document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const currentLocation = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentLocation === linkPath) {
            link.classList.add('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const ratingInputs = document.querySelectorAll('.rating-stars input');
    const ratingValue = document.getElementById('rating-value');

    ratingInputs.forEach(input => {
        input.addEventListener('change', function () {
            ratingValue.textContent = this.value + ' star' + (this.value !== '1' ? 's' : '');
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const flashMessages = document.querySelectorAll('.custom-flash');

    flashMessages.forEach(flash => {
        setTimeout(() => {
            if (flash) {
                const bsAlert = new bootstrap.Alert(flash);
                bsAlert.close();
            }
        }, 5000);

        flash.addEventListener('close.bs.alert', function (e) {
            e.preventDefault();
            flash.style.transition = 'all 0.3s ease-out';
            flash.style.transform = 'translateX(100%)';
            flash.style.opacity = '0';

            setTimeout(() => {
                const bsAlert = bootstrap.Alert.getInstance(flash);
                if (bsAlert) {
                    bsAlert.dispose();
                }
                flash.remove();
            }, 300);
        });
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const mapElement = document.getElementById('map');
    if (!mapElement || !coordinates) return;

    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coordinates,
        zoom: 11
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', function () {
        const marker = new mapboxgl.Marker({
            color: '#3182ce'
        })
            .setLngLat(coordinates)
            .addTo(map);

        const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false
        })
            .setLngLat(coordinates)
            .setHTML(`
                <div style="text-align: center;">
                    <strong>${listing.title}</strong>
                    <p style="margin: 5px 0 0;">${listing.location}</p>
                </div>
            `);

        marker.setPopup(popup);

        setTimeout(() => {
            marker.togglePopup();
        }, 1000);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const filtersContainer = document.getElementById('filtersContainer');
    const prevButton = document.querySelector('.btn-nav.prev');
    const nextButton = document.querySelector('.btn-nav.next');
    const progressBar = document.querySelector('.filters-progress .progress-bar');

    prevButton.disabled = true;

    function updateNavigation() {
        const scrollLeft = filtersContainer.scrollLeft;
        const maxScrollLeft = filtersContainer.scrollWidth - filtersContainer.clientWidth;

        prevButton.disabled = scrollLeft <= 0;
        nextButton.disabled = scrollLeft >= maxScrollLeft;

        const scrollProgress = scrollLeft / maxScrollLeft;
        const progressWidth = Math.min(100, Math.max(33, scrollProgress * 100));
        progressBar.style.width = progressWidth + '%';
        progressBar.style.transform = `translateX(${scrollProgress * (100 - progressWidth)}%)`;
    }

    prevButton.addEventListener('click', function () {
        filtersContainer.scrollBy({ left: -200, behavior: 'smooth' });
    });

    nextButton.addEventListener('click', function () {
        filtersContainer.scrollBy({ left: 200, behavior: 'smooth' });
    });

    filtersContainer.addEventListener('scroll', updateNavigation);

    window.addEventListener('resize', updateNavigation);

    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', function () {
            filterPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            const pillRect = this.getBoundingClientRect();
            const containerRect = filtersContainer.getBoundingClientRect();

            if (pillRect.left < containerRect.left) {
                this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            } else if (pillRect.right > containerRect.right) {
                this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'end' });
            }
        });
    });

    updateNavigation();
});



document.addEventListener('DOMContentLoaded', function () {
    const filtersContainer = document.querySelector('.filters-container');
    if (filtersContainer) {
        filtersContainer.addEventListener('wheel', function (e) {
            if (e.deltaY !== 0) {
                e.preventDefault();
                this.scrollLeft += e.deltaY;
            }
        });
    }

    const activeFilter = document.querySelector('.filter-pill.active');
    if (activeFilter) {
        setTimeout(() => {
            activeFilter.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 100);
    }
});

(() => {
    'use strict'

    const forms = document.querySelectorAll('.needs-validation')

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()
