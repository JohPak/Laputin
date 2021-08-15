//käynnistä "npm start". Jos haluaa suorittaa scriptissä olevan komennon, sitten "npm run start"
//käynnistä nodemonilla: npm run start-dev

const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const http = require('http');
const express = require('express');
const port = 8080
const path = require('path');

let app = express();


// console.log(url);

app.use(express.urlencoded({extended: true}));
app.use(express.json()) // To parse the incoming requests with JSON payloads

// SERVE STATIC FILES Now, you can load the files that are in the public directory
// app.use(express.static('public')) 
app.use(express.static(__dirname)); //NODEN käynnistyssijainti - saattaa muuttua jos appin siirtää jonnekin

let url= "";
let ean = "ean-koodi";
let tuote = "tuote";
let hinta = "hinta";
let kuvaus = "kuvaus";
let kuva = "https://www.minimani.fi/media/catalog/product/placeholder/default/minimaniph.png";



let haeSisalto = function() {
// console.log("siirrytty haeSisaltoon");
//HAETAAN SISÄLTÖ
got(url).then(response => {
        // console.log("siirrytty Gotiin");
        const $ = cheerio.load(response.body);
        // console.log($('a')[0]);
        
        // $('h1').each((i, tulos) => {
            //     const sisalto = tulos;
            //     console.log(sisalto);
            //   });
            
            ean = $('div[itemprop="sku"]').text();
            tuote = $('.base').text();
            hinta = $('meta[itemprop="price"]').attr("content");
            // kuvaus = $('.value p').text();
            kuvaus = $('div.value:nth-child(1)').text();
            kuva = "https://www.minimani.fi/media/catalog/product/" + ean.charAt(0) + "/" + ean.charAt(1) + "/" + ean + ".jpg";
            
            //korvataan hinnan piste pilkulla
            hinta = hinta.replace(".", ",");
            
        }).catch(err => {
            console.log(err, "Virhe sisällön noutamisessa: " + url);
            tuote = "Virhe! Onko www-osoite oikein?";
            kuvaus = "Tuotteen tietojen haku verkkokaupasta ei onnistunut. Onko www-osoite oikein? Toimiiko verkkosivut?";
            kuva = "https://www.minimani.fi/media/catalog/product/placeholder/default/minimaniph.png";
            res.redirect("/");

        });
} // END HAESISALTO


// hae html
app.get('/', function (req, res, next) {
    if (url.includes("www.minimani.fi/")) {
        
        // res.sendFile(__dirname+'/views/index.html');
        // nodessa ei voi käpistellä html-tiedostoja suoraan, joten muutetaan se stringiksi
        let html = fs.readFileSync("./views/index.html").toString("utf-8");
        
        html = html.replace("https://www.minimani.fi/media/catalog/product/placeholder/default/minimaniph.png", kuva);
        html = html.replace("{tuote}", tuote);
        html = html.replace("Lantahiputin", tuote);
        html = html.replace("{ean}", ean);
        html = html.replace("{hinta}", hinta + " €");
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
        html = html.replace("{kuvaus}", "tuotetiedot");
        res.send(html);
    }
  });

app.post('/hae', function (req, res, next) {
    url = req.body.urlinput;   
    console.log("Saatu url: " + url);
    haeSisalto();
    setTimeout(() => {  res.redirect("/"); }, 1000);
    
})


app.listen(process.env.PORT || port, () => { //Herokua varten. Heroku asettaa portin process.env.PORT:iin
    // console.log(`Laputin app listening at http://localhost:${port}`)
    // console.log(process.env.PORT ? `Herokun antama portti ${process.env.PORT}` : ``);
  })  





