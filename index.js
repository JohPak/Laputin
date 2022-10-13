//käynnistä "npm start". Jos haluaa suorittaa scriptissä olevan komennon, sitten "npm run start"
//käynnistä nodemonilla: npm run start-dev

const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const http = require('http');
const express = require('express');
const port = 8080
const path = require('path');
const { contains, parseHTML } = require('cheerio/lib/static');

let app = express();


// console.log(url);

app.use(express.urlencoded({extended: true}));
app.use(express.json()) // To parse the incoming requests with JSON payloads

// SERVE STATIC FILES Now, you can load the files that are in the public directory
// app.use(express.static('public')) 
app.use(express.static(__dirname)); //NODEN käynnistyssijainti - saattaa muuttua jos appin siirtää jonnekin

let url= "https://www.minimani.fi/living-peili-pyorea-60cm-kehyksella.html";
let ean = "ean-koodi";
let tuote = "tuote";
let hinta = "hinta";
let sulkuhinta = "x,xx €";
let kuvaus = "kuvaus";
let kuva = "https://www.minimani.fi/media/catalog/product/placeholder/default/minimaniph.png";
let lisakuva = "lisakuva";



app.get('/', function (req, res, next) {
    if (url.includes("www.minimani.fi/")) {
        
        // res.sendFile(__dirname+'/views/index.html');
        // nodessa ei voi käpistellä html-tiedostoja suoraan, joten muutetaan se stringiksi
        let html = fs.readFileSync("./views/index.html").toString("utf-8");
        
        // aaltosulkeissa olevat ovat ns. placeholdereita jotka on kirjoitettu html:n puolelle. Tässä ne korvataan muuttujien sisällöllä.
        html = html.replace("https://www.minimani.fi/media/catalog/product/placeholder/default/minimaniph.png", kuva);
        html = html.replace("{tuote}", tuote);
        html = html.replace("Lantahiputin", tuote);
        html = html.replace("{ean}", ean);
        html = html.replace("{viivakoodi}", ean);
        html = html.replace("{hinta}", hinta + " €");
        if (sulkuhinta != "" && sulkuhinta != NaN) {
            html = html.replace("{sulkuhinta}", "(" + sulkuhinta +")");
        }
        else {
            html = html.replace("{sulkuhinta}", "&nbsp;");
        }
        html = html.replace("{kuvaus}", kuvaus);
        html = html.replace("{url}", url);
        
        //lähetetään valmis sisältö
        res.send(html);
    }
    else {
        // console.log("Url puuttuu!");
        let html = fs.readFileSync("./views/index.html").toString("utf-8");
        html = html.replace("{url}", "Anna tuotteen www-osoite");
        html = html.replace("{tuote}", "tuote");
        html = html.replace("{ean}", "ean");
        html = html.replace("{hinta}", "hinta" + " €");
        html = html.replace("{sulkuhinta}", "sulkuhinta");
        html = html.replace("{kuvaus}", "tuotetiedot");
        res.send(html);
    }
  });

app.post('/hae', function (req, res, next) {
    url = req.body.urlinput;   
    console.log("Saatu url: " + url);
    

    let haeSisalto = function() {
        // console.log("siirrytty haeSisaltoon");
        //HAETAAN SISÄLTÖ
        got(url).then(response => {
                // console.log("siirrytty Gotiin");
                const $ = cheerio.load(response.body);
                // console.log($('a')[0]);
                // console.log("ladataan cheerio");
                
                // $('h1').each((i, tulos) => {
                //         const sisalto = tulos;
                //         console.log(sisalto);
                //       });
                    
                    // ean = $('div[itemprop="sku"]').text(); LAKKASI toimimasta 10/2022
                    ean = $('div[class="text-gray-light4"]').text(); // toimii 11.10.2022
                    // siivotaan kaikki ei-numeeriset merkit
                    ean = ean.replace(/\D/g,'');

                    tuote = $('.base').text();

                    // haetaan hinta, muutetaan luvuksi, varmistetaan pari desimaalia
                    hinta = $('meta[itemprop="price"]').attr("content");
                    if (hinta != undefined) {
                        hinta = parseFloat(hinta);
                        hinta = hinta.toFixed(2); //pidetään kaksi desimaalia                  
                    }
                    else {
                        // Jos tuotteella on alennushinta, itemprop="price":a ei oo olemassa. Joten:
                        // <span id="product-price-105505" data-price-amount="16.95" data-price-type="finalPrice" class="price-wrapper "><span class="price">16,95&nbsp;€</span></span>

                        hinta = $('span[data-price-type="finalPrice"]').attr("data-price-amount");
                        console.log(hinta);
                    }
                    
                    // haetaan sulkuhinta
                    sulkuhinta = $('span[data-price-type="oldPrice"]').attr("data-price-amount")
                    
                    if (sulkuhinta != NaN && sulkuhinta != undefined) {
                        sulkuhinta = sulkuhinta.replace(",", ".");
                        sulkuhinta = parseFloat(sulkuhinta);
                        // console.log(sulkuhinta);
                    }
                    else {
                        sulkuhinta = "";
                    }
                    
                    hinta = parseFloat(hinta);
                    
                    if (sulkuhinta === hinta) {
                        console.log("ei alennusta, myyntihinta on sama kuin sulkuhinta");
                        sulkuhinta = "";
                        hinta = hinta.toFixed(2);
                        hinta = hinta.toString();
                        hinta = hinta.replace(".", ",");
                    }
                    else if (sulkuhinta != undefined && sulkuhinta != NaN && sulkuhinta != "") {
                        console.log("sulkuhinta (" + sulkuhinta + ") eri kuin myyntihinta (" + hinta + ")");
                        hinta = hinta.toFixed(2);
                        hinta = hinta.toString();
                        hinta = hinta.replace(".", ",");
                        sulkuhinta = sulkuhinta.toFixed(2);
                        sulkuhinta = sulkuhinta.toString();
                        sulkuhinta = sulkuhinta.replace(".", ",");
                        sulkuhinta = sulkuhinta + " €";
                    }
                    else {
                        hinta = hinta.toFixed(2);
                        hinta = hinta.toString();
                        hinta = hinta.replace(".", ",");
                        sulkuhinta = "";
                    }
                    
                    // kuvaus = $('div.value:nth-child(1)').text(); LAKKASI toimimasta 10/2022
                    kuvaus = $('div[class="prose"]').text(); // toimii 11.10.2022
                    
                    kuva = "https://www.minimani.fi/media/catalog/product/" + ean.charAt(0) + "/" + ean.charAt(1) + "/" + ean + ".jpg";
                    
        
                    // lisäkuvia ei pysty hakemaan cheeriolla, koska cheerio ei näe scriptien luomia tageja
                    // lisakuva = $('img').length;
                    // console.log(lisakuva);

                    console.log(`haettu sisältö: ${ean}, ${tuote}, ${hinta}`);
                    console.log("---------------------------------------------");
                    res.redirect("/");

                    
                }).catch(err => {
                    console.log(err, "Virhe sisällön noutamisessa: " + url);
                    tuote = "Auts, nyrjähdin :.(";
                    kuvaus = "Tuotteen tietojen haku verkkokaupasta ei onnistunut. Onko www-osoite oikein? Toimiiko verkkosivut?";
                    hinta = "";
                    kuva = "https://www.minimani.fi/media/catalog/product/placeholder/default/minimaniph.png";
                    res.redirect("/");
                    
        
                });
        } // END HAESISALTO


        
    haeSisalto();



    // setTimeout(() => {  res.redirect("/"); }, 1000);
    
})


app.listen(process.env.PORT || port, () => { //Herokua varten. Heroku asettaa portin process.env.PORT:iin
    // console.log(`Laputin app listening at http://localhost:${port}`)
    // console.log(process.env.PORT ? `Herokun antama portti ${process.env.PORT}` : ``);
  })  





