// CHECKBOX TOGGLE
function toggleCheckboxVisibility(checkboxId, classname, hiddenClassname = null) {
    const iconElement = document.getElementById(checkboxId);
    const elements = document.querySelectorAll(`.${classname}`);
    const hiddenElements = hiddenClassname ? document.querySelectorAll(`.${hiddenClassname}`) : [];
    const isVisible = iconElement.textContent === "check_box_outline_blank";

    iconElement.textContent = isVisible ? "check_box" : "check_box_outline_blank";
    elements.forEach(element => element.style.display = isVisible ? 'block' : 'none');
    
    // Piilota tai näytä 'hiddenClassname' -elementit
    if (hiddenElements.length > 0) {
        hiddenElements.forEach(element => element.style.display = isVisible ? 'none' : 'block');
    }
}

document.getElementById("naytauutuus").addEventListener('click', () => toggleCheckboxVisibility("naytauutuuscheckbox", 'uutuus img'));
document.getElementById("naytaviivakoodi").addEventListener('click', () => toggleCheckboxVisibility("naytaviivakoodicheckbox", 'viivakoodi', 'ean'));

    // SLIDER TO ADJUST PROPERTIES
    function adjustSliderProperty(sliderId, elementsQuery, property, unit = 'vh', callback) {
        const slider = document.getElementById(sliderId);
        const elements = document.querySelectorAll(elementsQuery);
        slider.addEventListener('input', () => {
            elements.forEach(element => {
                element.style[property] = `${slider.value}${unit}`;
                if (callback) callback(element);
            });
        });
    }

    adjustSliderProperty('product-image-size', '.tuotekuva-img', 'width', 'vh', (img) => img.style.height = 'auto');
    adjustSliderProperty('product-image-position', '.tuotekuva-img', 'marginTop');
    adjustSliderProperty('text-position-slider', '.tuotekuva-img', 'marginBottom');
    adjustSliderProperty('product-info-size', '.kuvaus', 'fontSize', 'vh', (info) => {
        const newSize = parseFloat(info.style.fontSize);
        info.style.lineHeight = `${newSize * 1.2}vh`;
    });



// Kehysten näyttämisen/piilottamisen toiminto
function toggleFrames() {
    const toggleFramesButton = document.querySelector(".gray-btn[title='Tulosta mustien kehysten kanssa (blankkoon muovitaskuun)']");
    const framesCheckbox = document.getElementById("tulostareunatcheckbox");
    const frames = document.querySelectorAll(".kehys img");
    const hintalappu = document.querySelector('.hintalappu');

    let framesVisible = true;

    toggleFramesButton.addEventListener("click", () => {
        framesVisible = !framesVisible;
        hintalappu.classList.toggle('active'); // Jätetään vain yksi 'toggle'

        frames.forEach(frame => {
            frame.style.display = framesVisible ? "block" : "none";
        });

        framesCheckbox.innerText = framesVisible ? "check_box" : "check_box_outline_blank";
    });
}






// Näkymän skaalaus
function initializeScaling() {
    let scale = 1;
    const contentElement = document.querySelector('.content');

    document.querySelector('.scale-up').addEventListener('click', () => adjustScale(0.2));
    document.querySelector('.scale-down').addEventListener('click', () => adjustScale(-0.2));

    function adjustScale(value) {
        scale = Math.max(scale + value, 0.1);
        contentElement.style.transform = `scale(${scale})`;
    }
}




    
// Yleinen funktio, joka initialisoi kaikki funktiot
export function initializeCheckboxFunctions() {
    // Kutsu funktioita oikeilla argumenteilla
    toggleCheckboxVisibility("naytauutuuscheckbox", 'uutuus img');
    toggleCheckboxVisibility("naytaviivakoodicheckbox", 'viivakoodi', 'ean');

    adjustSliderProperty('product-image-size', '.tuotekuva-img', 'width', 'vh', (img) => img.style.height = 'auto');
    adjustSliderProperty('product-image-position', '.tuotekuva-img', 'marginTop');
    adjustSliderProperty('text-position-slider', '.tuotekuva-img', 'marginBottom');
    adjustSliderProperty('product-info-size', '.kuvaus', 'fontSize', 'vh', (info) => {
        const newSize = parseFloat(info.style.fontSize);
        info.style.lineHeight = `${newSize * 1.2}vh`;
    });
    toggleFrames();
    initializeScaling();
}

// Muista, että tarvitset DOM-latautumisen kuuntelijan (DOMContentLoaded) kun kutsut initialisointifunktiota
// Jotta varmistetaan, että kaikki elementit ovat ladattuja ja saatavilla, kun kutsut funktioita
document.addEventListener('DOMContentLoaded', initializeCheckboxFunctions);
document.addEventListener('DOMContentLoaded', toggleFrames);