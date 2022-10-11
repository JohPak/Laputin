# Hintalaputin

## Mikä se on?

Käyttäjä kopioi tuotteen url-osoitteen verkkokaupasta, syöttää sen Hintalaputtimeen ja saa tulokseksi **tuotteen kuvalla varustetun hintalapun tulostettavaksi** A2/A4-koossa.



| Hintalaputin muokkaustilassa                                | Tulostuksen esikatselu                                  |
| ----------------------------------------------------------- | ------------------------------------------------------- |
| ![alt text](/img/edit.png "Hintalaputin muokkaustilassa")   | ![alt text](/img/print.png "Tulostuksen esikatselu") |

## Ominaisuuksia

- Hintalapun tekstit ovat muokattavissa klikkaamalla 
- Tuotekuvaa voi kääntää 90° välein 
- Tuotekuvan kokoa voi säätää liukusäätimellä 
- Tuotekuvan sijaintia pystysuunnassa voi säätää liukusäätimellä 
- Tuotekuva on mahdollista vaihtaa toiseksi png- tai jpg-kuvaksi. "Kuvan url"-painike avaa syöttölaatikon, johon voi liittää tai kirjoittaa toisen url-osoitteen. 
- Tekstien sijaintia pystysuunnassa suhteessa kuvaan voi säätää liukusäätimellä 
- Tuotetietojen kirjasinkokoa voi säätää liukusäätimellä
- Esikatselun kokoa voi muuttaa - ja +-painikkeilla. Koon muutos ei vaikuta tulostuskokoon. 
- Käyttäjä voi valita haluaako mustan kehyksen tulostukseen mukaan rastimalla "tulosta kehykset". 

## Miten se toimii?

Hintalaputin toimii [verkkoharavoinnilla](https://en.wikipedia.org/wiki/Web_scraping), käyttäen [cheerio](https://www.npmjs.com/package/cheerio)ta. Se poimii **julkisella verkkosivulla näkyviä tietoja**, kuten tuotteen nimen, tiedot ja hinnan. Nämä saadut tiedot asetellaan mieleisesti, tässä tapauksessa hintalappuun sopivaksi kokonaisuudeksi tulostamista varten.

## Missä se toimii?

Hintalaputin on muuttanut [Cyclic:iin](https://laputin.cyclic.app/) Herokun lopettaessa ilmaisen alustan tarjoamisen 11/2022.