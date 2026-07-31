# Robots.txt Analysis — velpitar.ro (VEL PITAR SA)

Sursa: https://velpitar.ro/robots.txt

## Reguli

```
User-agent: *
Allow: /
Disallow: /cgi-bin/
```

## Interpretare

| Cale | Accesibil? | Ce conține |
|---|---|---|
| `/` | ✅ Allowed | Tot site-ul |
| `/cgi-bin/` | ❌ Disallowed | Scripturi CGI (nefolosite de scraper) |
| `/wp-json/wp/v2/posts` | ✅ Allowed | API-ul REST WordPress (sursa job-urilor) |
| `/wp-json/wp/v2/categories` | ✅ Allowed | API-ul REST WordPress (mapare orașe) |

## Recomandare

robots.txt NU este legal binding, dar reprezintă intenția proprietarului site-ului.

- Site-ul este un WordPress care permite crawl-ul complet (`Allow: /`).
- Scraperul folosește API-ul public WP REST (`/wp-json/`) — accesibil fără autentificare, acoperit de `Allow: /`.
- Fiecare cerere folosește User-Agent-ul identificabil `job_seeker_ro_spider`.
- Scraperul face 1 cerere per pagină (10 job-uri) cu delay de 1s între pagini — comportament rezonabil, nu agresiv.

## Diferență față de EPAM template

| | EPAM (template) | VEL PITAR (derivat) |
|---|---|---|
| robots.txt | `Disallow: /` — API-ul disallowed, dar accesibil | `Allow: /` — totul permis |
| Sursa job-uri | API SOLR (`/api/jobs/v2/...`) | WP REST (`/wp-json/wp/v2/posts?categories=211`) |
| Riscul | Minim (site permite, dar robots dezaprobă explicit) | Scăzut (site-ul permite crawl explicit) |

**Concluzie**: Risc scăzut. robots.txt permite explicit crawl-ul, API-ul WP REST e public, iar scraperul e politicos (rate limiting, User-Agent standard, o singură cerere simultană).
