const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

const XML_FILE_PATH = path.join(__dirname, 'daily_xml_data.xml');

function formatPrice(priceString) {
    if (!priceString || typeof priceString !== "string") {
        return priceString;
    }
    
    let price = parseFloat(priceString);
    if (isNaN(price)) {
        return priceString;
    }
    
    return price.toFixed(2).replace('.', ',');
}

async function fetchXmlData() {
    // const response = await axios.get('https://www.minimani.fi/media/feed/Johannan_testi_xml.xml');
    const response = await axios.get('https://www.minimani.fi/media/feed/publitas-04-2023.xml');
    return response.data;
}

async function getXmlDataForToday() {
    const today = new Date().toISOString().split('T')[0];
    const exists = fs.existsSync(XML_FILE_PATH);

    if (exists) {
        const fileStats = fs.statSync(XML_FILE_PATH);
        const fileDate = new Date(fileStats.mtime).toISOString().split('T')[0];

        if (fileDate === today) {
            console.log("XML ladattu jo tänään, käytetään sitä.");
            return fs.readFileSync(XML_FILE_PATH, 'utf8');
        }
    }

    const data = await fetchXmlData();
    fs.writeFileSync(XML_FILE_PATH, data, 'utf8');
    return data;
}

// Apufunktio tarkistamaan, vastaako tuote käyttäjän antamaa hakusanaa
function productMatchesQuery(product, query) {
    const productName = product.title.toLowerCase();
    const productId = String(product.id); // Muutetaan ID merkkijonoksi

    const searchQuery = query.toLowerCase();
    const isNumericQuery = /^\d+$/.test(searchQuery); // Tarkistaa, ovatko kaikki merkit numeroita

    // Ensin tarkistetaan, löytyykö hakusana tuotenimestä
    const searchWords = searchQuery.split(' ');
    const nameMatch = searchWords.every(word => productName.includes(word));

    if (nameMatch) {
        return true;
    } else if (isNumericQuery) {
        // Jos tuotenimestä ei löytynyt, ja hakusana on numeerinen, tarkistetaan ID:stä
        return productId === searchQuery;
    } else {
        // Jos mikään ei löytynyt, palautetaan false
        return false;
    }
}



app.get('/products', async (req, res) => {
    const query = req.query.query;
    let product;  // Käytetään yksikkömuotoa, koska palautamme vain yhden tuotteen
    let querySubmitted = false;
    let errorMessage = null;

    if (query) {
        querySubmitted = true;

        try {
            const data = await getXmlDataForToday();
            const parsedData = await xml2js.parseStringPromise(data);
            
            if (!parsedData.rss || !parsedData.rss.channel || !parsedData.rss.channel[0].item) {
                res.status(400).send('XML-tiedostossa ei ole tietueita.');
                return;
            }

            const allProducts = parsedData.rss.channel[0].item.map(item => ({
                title: item.title[0],
                description: item.description[0],
                link: item.link[0],
                brand: item['g:brand'][0],
                price: formatPrice(item['g:price'][0]),
                saleprice: formatPrice(item['g:sale_price'][0]),
                imageLink: item['g:image_link'][0],
                alternateImages: item['g:image_alternate'][0].split(',').map(url => url.trim()),
                id: item['g:id'][0]
            }));

            // Etsi ensimmäinen tuote, joka vastaa hakusanaa
            product = allProducts.find(product => productMatchesQuery(product, query));

            if (!product) {
                errorMessage = "Ei hakutuloksia.";
            }
            
        } catch (error) {
            if (error.response && error.response.status === 404) {
                res.status(404).send('XML-tiedostoon ei saatu yhteyttä.');
                return;
            } else {
                res.status(500).send('Virhe datan hakemisessa.');
                return;
            }
        }
    }

    res.render('products', {
        product: product,  // Lähetä tuote näkymälle
        errorMessage: errorMessage,
        querySubmitted: querySubmitted
    });
});

app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}/products`);
});
