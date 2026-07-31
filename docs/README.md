# job_seeker_ro_spider

**job_seeker_ro_spider** — scraper pentru job-urile VEL PITAR SA din România.

Extrage anunțurile de pe [Vel Pitar Cariere](https://velpitar.ro/cariere-vel-pitar/) și le publică în [peviitor.ro](https://peviitor.ro) prin API-ul Peviitor.

> **🌱 Derived scraper.** Acest repo este un **scraper derivat** din [epam-systems-international-srl-nodejs-scraper](https://github.com/sebiboga/epam-systems-international-srl-nodejs-scraper).

## Identificare

Toate request-urile HTTP folosesc User-Agent-ul:

```
job_seeker_ro_spider
```

## Ce face

1. **Validează compania** — interoghează API-ul public ANAF ([demoanaf.ro](https://demoanaf.ro)) după CIF-ul VEL PITAR (21229091), cu fallback pe CUIScan/CUIFirma, și verifică:
   - Denumirea oficială: VEL PITAR SA
   - Status: activ/inactiv/radiat
   - Adresa completă din registrul comerțului
2. **Cross-validează cu Peviitor** — verifică existența companiei în API-ul Peviitor
3. **Scrape-uiește job-urile** — extrage lista completă de job-uri din API-ul WordPress REST al velpitar.ro (categoria „Cariere", id 211), paginat
4. **Maparea locațiilor** — derivează orașele din categoriile WordPress ale fiecărui post (brasov → Brașov, cluj → Cluj-Napoca, valcea → Râmnicu Vâlcea etc.)
5. **Transformă datele** — normalizează locațiile (doar orașe românești), tag-urile (lowercase), workmode-ul (remote/on-site/hybrid)
6. **Stochează în Peviitor** — upsert prin API-ul Peviitor (job-uri și date companie)
7. **Generează jobs.md** — fișier markdown cu informații companie + toate job-urile curente

## API-uri folosite

| API | URL | Autentificare |
|---|---|---|
| VEL PITAR WP REST | `https://velpitar.ro/wp-json/wp/v2/...` | Public |
| ANAF (demoanaf) | `https://demoanaf.ro/api/...` | Public (fallback: CUIScan, CUIFirma) |
| Peviitor | `https://api.peviitor.ro/v1/company/` | Public |

## Robots.txt

velpitar.ro [robots.txt](https://velpitar.ro/robots.txt) permite crawl-ul integral (`Allow: /`), cu excepția `/cgi-bin/`. API-ul WP REST folosit de scraper este acoperit de `Allow: /`.

Scraper-ul folosește API-ul cu rate limiting (1s delay între pagini, 10 job-uri/cerere) și un singur User-Agent identificabil. Paginile individuale de job sunt doar verificate (HEAD request), nu parse-uite.

Pentru analiza completă, vezi [ai/ROBOTS.md](../ai/ROBOTS.md).

## Testare

```bash
# Toate testele
npm test

# Doar unitare
npm run test:unit

# Doar integrare (necesită ANAF live, Peviitor API conditional)
npm run test:integration

# Doar E2E (API real velpitar.ro + ANAF + Peviitor)
npm run test:e2e
```

Testele Peviitor API folosesc `itIfApi` — se auto-skip dacă API-ul Peviitor nu e disponibil.
