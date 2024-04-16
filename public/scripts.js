import { initializeImageFunctions } from './scripts/imageFunctions.js';
import { initializeCheckboxFunctions } from './scripts/checkboxFunctions.js';



document.addEventListener('DOMContentLoaded', function() {
    
    // KUVIEN KÄSITTELYFUNKTIOT:
    initializeImageFunctions();
    
    // SLIDERIT / CHECKBOXIT KÄSITTELYFUNKTIOT:
    initializeCheckboxFunctions();
    
    // PIDÄ FOCUS HAKUKENTÄSSÄ
    const searchInput = document.querySelector('.hakukentta');
    if (searchInput) {
        searchInput.focus();
    }



    window.onload = function() {
        const searchInput = document.querySelector('.hakukentta');
        
        if (searchInput) {
            // Jos hakukenttä on tyhjä, näytä animaatio
            if (!searchInput.value) {
                searchInput.classList.add('hakukentta-initial-load'); 
            }
            searchInput.focus();
        }
    };


// Talleta viimeisin hakusana localstorageen
// Haetaan hakukenttä ja määritellään tallennusavain
const hakukentta = document.querySelector('.hakukentta');
const tallennusavain = 'viimeisinHaku';

// Tarkista, onko tallennettua hakusanaa
const tallennettuHaku = localStorage.getItem(tallennusavain);

// Aseta tallennettu hakusana hakukenttään
if (tallennettuHaku) {
    hakukentta.value = tallennettuHaku;
}

// Kuuntele hakukentän muutoksia
hakukentta.addEventListener('input', function() {
    // Tallenna hakusana localStorageen aina kun se muuttuu
    localStorage.setItem(tallennusavain, hakukentta.value);
});


// HAKU-PAINIKE ODOTA-PAINIKKEEKSI
document.getElementById("searchButton").addEventListener("click", function() {
    // Muuta napin teksti "Odota":ksi ja muuta sen väri
    this.textContent = 'Odota';
    this.style.backgroundColor = '#868686';
});

// Tämä kuuntelee lomakkeen 'submit' tapahtumaa, joka tapahtuu myös kun käyttäjä painaa 'Enter'
document.querySelector('form').addEventListener('submit', function() {
    var btn = document.getElementById("searchButton");
    btn.textContent = 'Odota';
    btn.style.backgroundColor = '#868686';
});


/* Lisätty tulostusfunktio 16.4.2024, joka nollaa .content -elementin esikatseluskaalauksen siksi aikaa kun ollaan tulostamassa ja palauttaa esikatseluskaalauksen takaisin tulostuksen jälkeen. */
window.removeStyleAndPrint = function() {
    const contentElement = document.querySelector('.content');
    const originalTransform = contentElement.style.transform; // Tallenna alkuperäinen transform-arvo

    // Poista style-attribuutti
    contentElement.removeAttribute('style');

    // Avaa tulostusikkuna
    window.print();

    // Tulostuksen jälkeen, palauta alkuperäinen esikatseluskaalaus
    contentElement.style.transform = originalTransform; // Palauta alkuperäinen transform-arvo
}








});
