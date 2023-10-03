// Yksityinen funktio vaihtaa pääkuvaa
function changeMainImage() {
    document.querySelectorAll('.thumbnail').forEach(thumbnail => {
        thumbnail.addEventListener('click', function(e) {
            const mainProductImage = e.target.closest('.parent-lisakuvat').nextElementSibling.querySelector('.tuotekuva-img');
            mainProductImage.src = e.target.src;
        });
    });
}

// Yksityinen funktio käsittelee kuvan kääntämisen
function rotateImage() {
    document.getElementById('rotateBtn').addEventListener('click', function() {
        document.querySelectorAll('.tuotekuva-img').forEach(img => {
            const rotationDegree = (parseInt(img.getAttribute('data-rotation') || 0) + 90);
            img.style.transform = `rotate(${rotationDegree}deg)`;
            img.setAttribute('data-rotation', rotationDegree);
        });
    });
}

// Yksityinen funktio näyttää kuvan URL:n popup-ikkunassa
// Yksityinen funktio näyttää kuvan URL:n popup-ikkunassa
function showImageURLPopup() {
    document.getElementById('urlButton').addEventListener('click', function() {
        const imageUrl = document.querySelector('.tuotekuva-img').getAttribute('src');
        document.getElementById('currentUrl').textContent = "Nykyinen tuotekuvan URL-osoite: " + imageUrl;
        document.getElementById('newUrl').value = '';
        document.getElementById('urlPopup').style.display = 'block';
    });
    
    // Tässä lisätään tapahtumakuuntelija Peruuta-napille
    document.getElementById('cancelButton').addEventListener('click', closeImageURLPopup);
}


// Yksityinen funktio muuttaa kuvan URL:ää popup-ikkunasta
function changeImageURL() {
    document.getElementById('changeUrlButton').addEventListener('click', function() {
        document.querySelector('.tuotekuva-img').src = document.getElementById('newUrl').value;
        document.getElementById('urlPopup').style.display = 'none';
    });
}
function closeImageURLPopup() {
    document.getElementById('urlPopup').style.display = 'none';
}


// Yleinen funktio, joka initialisoi kaikki kuvatoiminnot
export function initializeImageFunctions() {
    changeMainImage();
    rotateImage();
    showImageURLPopup();
    changeImageURL();
    closeImageURLPopup();
}
