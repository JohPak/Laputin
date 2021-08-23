# Hintalaputin

## Mikä se on?

Käyttäjä kopioi tuotteen url-osoitteen verkkokaupasta, syöttää sen Hintalaputtimeen ja saa tulokseksi **tuotteen kuvalla varustetun hintalapun tulostettavaksi** A2/A4-koossa.



| Hintalaputin muokkaustilassa                                | Tulostuksen esikatselu                                  |
| ----------------------------------------------------------- | ------------------------------------------------------- |
| ![alt text](/img/edit.png "Hintalaputin muokkaustilassa")   | ![alt text](/img/print.png "Tulostuksen esikatselu") |

Kaikkia hintalappuun tulevia **tekstejä on mahdollista muokata** klikkaamalla. **Kuvaa voi kääntää** käännä-painikkeella, ja sen **kokoa voi muuttaa** liukusäätimellä. **Esikatselun kokoa** voi suurentaa tai pienentää + ja - -painikkeilla. 
Myös **tekstien sijaintia** ja **tuotetietojen kokoa** voi säätää liukusäätimillä.

Käyttäjä voi valita haluaako tulostaa hintalapun mustalla kehyksellä vai ilman kehystä (oletus).

## Miten se toimii?

Hintalaputin käyttää toimiakseen [verkkoharavointia](https://en.wikipedia.org/wiki/Web_scraping), tarkemmin [cheerio](https://www.npmjs.com/package/cheerio)ta. Se poimii **julkisella verkkosivulla näkyviä tietoja**, kuten tuotteen nimen, tiedot ja hinnan. Nämä saadut tiedot asetellaan mieleisesti, tässä tapauksessa hintalappuun sopivaksi kokonaisuudeksi tulostamista varten.
