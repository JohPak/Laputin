const express = require('express');
const axios = require('axios');
const path = require('path');
const { chromium } = require('playwright'); // Tuodaan chromium Playwrightista
const app = express();
const port = 3000;
const cheerio = require('cheerio');
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Aseta chromedriverin polku
const chromeDriverPath = path.join(__dirname, 'node_modules', 'chromedriver', 'lib', 'chromedriver', 'chromedriver');
const chromeOptions = new chrome.Options().headless().setChromeBinaryPath(chromeDriverPath);
console.log('ChromeDriver path:', chromeDriverPath);



app.set('view engine', 'ejs');
app.use(express.static('public'));



// ****** FUNKTIOT **************************

async function scrapeImageUrls(url, mainImageUrl) {
    let driver;

    try {
        driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
        await driver.get(url);

        // Haetaan kuvien URL:t
        const images = await driver.findElements(By.css('#thumbs img'));
        const additionalImageUrls = [];

        for (const img of images) {
            additionalImageUrls.push(await img.getAttribute('src'));
        }

        // Muokataan lisäkuvien URL:eja regexillä ja lisätään pääkuva ensimmäiseksi
        const allImageUrls = [
            mainImageUrl,
            ...additionalImageUrls.map(url => url.replace(/cache\/[a-f0-9]{32}\//, ''))
        ];

        return allImageUrls;
    } catch (error) {
        console.error("Error scraping image URLs:", error);
        return [mainImageUrl]; // Palautetaan ainakin pääkuva virhetilanteessa
    } finally {
        if (driver) {
            await driver.quit(); // Varmistetaan, että ajuri suljetaan aina
        }
    }
}


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

function productMatchesQuery(product, query) {
    const productName = product.title.toLowerCase();
    const productId = String(product.id);

    const searchQuery = query.toLowerCase();
    const isNumericQuery = /^\d+$/.test(searchQuery);

    const searchWords = searchQuery.split(' ');
    const nameMatch = searchWords.every(word => productName.includes(word));

    if (nameMatch) {
        return true;
    } else if (isNumericQuery) {
        return productId === searchQuery;
    } else {
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
                const description = await scrapeDescription(item.url);

                let hinta = formatPrice(item.price);
                let tarjoushinta = formatPrice(item.salePrice);
                
                if (parseFloat(tarjoushinta) >= parseFloat(hinta)) {
                    tarjoushinta = null;
                }

                // Extract image file extension
                const imageExtension = path.extname(item.image);

                // Create additional image URLs
                const additionalImageUrls = Array.from({ length: 4 }, (_, i) => 
                    item.image
                        .replace(stringToReplace, replacementString)
                        .replace(/cache\/[a-f0-9]{32}\//, '')
                        .replace(imageExtension, `_${i + 2}${imageExtension}`)
                );

                // Muokataan pääkuvan URL ja tallennetaan se muuttujaan
                const mainImageUrl = item.image.replace(stringToReplace, replacementString).replace(/cache\/[a-f0-9]{32}\//, '');

                return {
                    title: item.name,
                    description: description || "",
                    link: item.url,
                    brand: item.brandit || "",
                    saleprice: tarjoushinta,
                    price: hinta,
                    imageLink: item.image.replace(stringToReplace, replacementString).replace(/cache\/[a-f0-9]{32}\//, ''),
                    additionalImageUrls: await scrapeImageUrls(item.url, mainImageUrl), // Käytä Nightmare-funktiota
                    id: item.sku
                };
            }));

            product = allProducts.find(product => productMatchesQuery(product, query));

            if (!product) {
                errorMessage = "Ei hakutuloksia";
            }
            
        } catch (error) {
            console.error("Detailed error:", error);
        
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
