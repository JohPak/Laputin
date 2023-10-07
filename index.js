// npm run dev

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// ****** FUNKTIOT **************************


async function fetchImageUrls(url, sku) {
    try {
        const { data } = await axios.get(url); // Hae sivun HTML
        const correctedData = data.replace(/\\\//g, '/'); // Korvaa kaikki '\/' merkit '/' merkeillä

        // Etsi kaikki merkkijonot, jotka alkavat "full":"https://www.minimani.fi/media/catalog/product
        const regex = /"full":"https:\/\/www\.minimani\.fi\/media\/catalog\/product[^"]+/g;
        const matches = correctedData.match(regex);

        // Poista "full": alusta ja palauta löydetyt URL:t
        let imageUrls = matches ? matches.map(match => match.replace(/"full":"/, '')) : [];

        // Poista duplikaatit käyttämällä Set-objektia ja spread-syntaksia
        let uniqueImageUrls = [...new Set(imageUrls)];

        // Jos kuvia ei löytynyt, yritä hakea kuvaa antamastasi URL-osoitteesta
        // if (uniqueImageUrls[0] === "https://www.minimani.fi/media/catalog/product/placeholder/default/minimaniph.png" && sku) {
        //     const fallbackImageUrl = `https://public.keskofiles.com/f/k-ruoka/product/${sku}`;
        //     try {
        //         const response = await axios.get(fallbackImageUrl);
        //         if (response.status === 200) {
        //             uniqueImageUrls = [fallbackImageUrl];
        //         }
        //     } catch (error) {
        //         console.error("Error fetching the fallback image URL: ", error);
        //     }
        // }

        return uniqueImageUrls;
    } catch (error) {
        console.error("Error fetching the URL: ", error);
        return [];
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

    return nameMatch || (isNumericQuery && productId === searchQuery);
}

app.get('/', async (req, res) => {
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
                const url = item.url;
                const description = await scrapeDescription(item.url);
                const additionalImageUrls = await fetchImageUrls(url, item.sku);
                let hinta = formatPrice(item.price);
                let tarjoushinta = formatPrice(item.salePrice);

                // Jos tarjoushinta ei ole määritelty tai se on suurempi tai yhtä suuri kuin hinta, se asetetaan arvoon null. Muussa tapauksessa se jätetään ennalleen.
                if (!tarjoushinta || parseFloat(tarjoushinta) >= parseFloat(hinta)) {
                    hinta = null;
                }

                // Tarkista, onko item.image tyhjä, ja jos on, käytä oletus-URL-osoitetta
                const imageLink = item.image 
                ? item.image.replace(stringToReplace, replacementString).replace(/cache\/[a-f0-9]{32}\//, '')
                : 'https://www.minimani.fi/media/catalog/product/placeholder/default/minimaniph.png';


                return {
                    title: item.name,
                    description: description || "",
                    link: item.url,
                    brand: item.brandit || "",
                    saleprice: tarjoushinta,
                    price: hinta,
                    imageLink: imageLink,
                    additionalImageUrls: additionalImageUrls,
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
    console.log(`App is running at http://localhost:${port}/`);
});
