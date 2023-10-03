document.addEventListener('DOMContentLoaded', function() {
    
    // PIDÄ FOCUS HAKUKENTÄSSÄ
    const searchInput = document.querySelector('.hakukentta');
    if (searchInput) {
        searchInput.focus();
    }

    // VAIHDA PÄÄKUVA
    document.querySelectorAll('.thumbnail').forEach(thumbnail => {
        thumbnail.addEventListener('click', function(e) {
            const mainProductImage = e.target.closest('.parent-lisakuvat').nextElementSibling.querySelector('.tuotekuva-img');
            mainProductImage.src = e.target.src;
        });
    });

    // KÄÄNNÄ-painike
    document.getElementById('rotateBtn').addEventListener('click', function() {
        document.querySelectorAll('.tuotekuva-img').forEach(img => {
            const rotationDegree = (parseInt(img.getAttribute('data-rotation') || 0) + 90);
            img.style.transform = `rotate(${rotationDegree}deg)`;
            img.setAttribute('data-rotation', rotationDegree);
        });
    });

    // POPUP-IKKUNA
    document.getElementById('urlButton').addEventListener('click', function() {
        const imageUrl = document.querySelector('.tuotekuva-img').getAttribute('src');
        document.getElementById('currentUrl').textContent = "Nykyinen tuotekuvan URL-osoite: " + imageUrl;
        document.getElementById('newUrl').value = '';
        document.getElementById('urlPopup').style.display = 'block';
    });

    document.getElementById('cancelButton').addEventListener('click', function() {
        document.getElementById('urlPopup').style.display = 'none';
    });

    document.getElementById('changeUrlButton').addEventListener('click', function() {
        document.querySelector('.tuotekuva-img').src = document.getElementById('newUrl').value;
        document.getElementById('urlPopup').style.display = 'none';
    });

    // SKAALAUS
    let scale = 1;
    const contentElement = document.querySelector('.content');

    document.querySelector('.scale-up').addEventListener('click', () => adjustScale(0.2));
    document.querySelector('.scale-down').addEventListener('click', () => adjustScale(-0.2));

    function adjustScale(value) {
        scale = Math.max(scale + value, 0.1);
        contentElement.style.transform = `scale(${scale})`;
    }

    // CHECKBOX TOGGLE
    function toggleCheckboxVisibility(checkboxId, classname) {
        const iconElement = document.getElementById(checkboxId);
        const elements = document.querySelectorAll(`.${classname}`);
        const isVisible = iconElement.textContent === "check_box_outline_blank";

        iconElement.textContent = isVisible ? "check_box" : "check_box_outline_blank";
        elements.forEach(element => element.style.display = isVisible ? 'block' : 'none');
    }

    document.getElementById("naytauutuus").addEventListener('click', () => toggleCheckboxVisibility("naytauutuuscheckbox", 'uutuus img'));
    document.getElementById("naytaviivakoodi").addEventListener('click', () => toggleCheckboxVisibility("naytaviivakoodicheckbox", 'viivakoodi'));

    // SLIDER TO ADJUST PROPERTIES
    function adjustSliderProperty(sliderId, elementsQuery, property, unit = 'px', callback) {
        const slider = document.getElementById(sliderId);
        const elements = document.querySelectorAll(elementsQuery);
        slider.addEventListener('input', () => {
            elements.forEach(element => {
                element.style[property] = `${slider.value}${unit}`;
                if (callback) callback(element);
            });
        });
    }

    adjustSliderProperty('product-image-size', '.tuotekuva-img', 'width', 'px', (img) => img.style.height = 'auto');
    adjustSliderProperty('product-image-position', '.tuotekuva-img', 'marginTop');
    adjustSliderProperty('text-position-slider', '.tuotekuva-img', 'marginBottom');
    adjustSliderProperty('product-info-size', '.kuvaus', 'fontSize', 'px', (info) => {
        const newSize = parseFloat(info.style.fontSize);
        info.style.lineHeight = `${newSize * 1.2}px`;
    });
});
