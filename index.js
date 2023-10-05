const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;
const cheerio = require('cheerio');
const puppeteer = require('puppeteer'); // käytetään headless-selainta jotta pystytään hakemaan sivulla dynaamisesti luodut lisäkuvat (näihin ei pääse muuten kiinni)

app.set('view engine', 'ejs');
app.use(express.static('public'));


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

async function scrapeImageUrls(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    // Get image URLs
    const imageUrls = await page.evaluate(() => {
        const imageUrls = [];
        const regex = /cache\/[a-f0-9]{32}\//;

        // Fetching main image from #gallery
        const mainImageElement = document.querySelector('#gallery img');
        if (mainImageElement) {
            let mainImageUrl = mainImageElement.src;
            mainImageUrl = mainImageUrl.replace(regex, ''); // Applying regex
            imageUrls.push(mainImageUrl);
        }

        // Fetching additional images from #thumbs
        const thumbImages = document.querySelectorAll('#thumbs img');
        thumbImages.forEach((img) => {
            let imageUrl = img.src;
            imageUrl = imageUrl.replace(regex, ''); // Applying regex
            if (imageUrl && !imageUrls.includes(imageUrl)) {
                imageUrls.push(imageUrl);
            }
        });

        return imageUrls;
    });

    await browser.close();
    return imageUrls;
}
async function scrapeDescription(url) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        // Get content of div with class 'prose'
        const description = $('.prose').html();
        
        return description;
    } catch (error) {
        console.error("Error fetching the URL: ", error);
        return null;
    }
}





async function fetchJsonData(query) {
    const url = `https://eucs13.ksearchnet.com/cloud-search/n-search/search?ticket=klevu-15596371644669941&term=${encodeURIComponent(query)}&paginationStartsFrom=0&sortPrice=false&ipAddress=undefined&analyticsApiKey=klevu-15596371644669941&showOutOfStockProducts=true&klevuFetchPopularTerms=false&klevu_priceInterval=500&fetchMinMaxPrice=true&klevu_multiSelectFilters=true&noOfResults=1&enableFilters=false&filterResults=&visibility=search&category=KLEVU_PRODUCT&sv=229&lsqt=&responseType=json`;
    const response = await axios.get(url);
    return response.data;
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
    let product;
    let querySubmitted = false;
    let errorMessage = null;
    const stringToReplace = "needtochange/media/klevu_images/200X200/";
    const replacementString = "media/catalog/product/";

    if (query) {
        querySubmitted = true;

        try {
            const data = await fetchJsonData(query);
            
            const allProducts = await Promise.all(data.result.map(async item => {
                // Scrape description from the product page
                const description = await scrapeDescription(item.url);

                // Format prices
                let hinta = formatPrice(item.price);
                let tarjoushinta = formatPrice(item.salePrice);
                
                if (parseFloat(tarjoushinta) >= parseFloat(hinta)) {
                    tarjoushinta = null;
                }
                


                return {
                    title: item.name,
                    description: description || "",
                    link: item.url,
                    brand: item.brandit || "",
                    saleprice: tarjoushinta, // <-- Käytä uutta muuttujan nimeä
                    price: hinta, // <-- Käytä uutta muuttujan nimeä
                    imageLink: item.image.replace(stringToReplace, replacementString),
                    id: item.sku
                };
                
            }));

            product = allProducts.find(product => productMatchesQuery(product, query));

            if (product) {
                // Scrape additional image URLs from the product page
                product.additionalImageUrls = await scrapeImageUrls(product.link);
            } else {
                errorMessage = "Ei hakutuloksia";
            }
            
        } catch (error) {
            console.error("Detailed error:", error); // Tulostaa virheen tiedot konsoliin
        
            if (error.response && error.response.status === 404) {
                res.status(404).send('JSON-tiedostoon ei saatu yhteyttä.');
                return;
            } else {
                res.status(500).send('Virhe datan hakemisessa.');
                return;
            }
        }
        
    }

    res.render('products', {
        product: product,
        errorMessage: errorMessage,
        querySubmitted: querySubmitted
    });
});





app.listen(port, () => {
    console.log(`App is running at http://localhost:${port}/products`);
});
