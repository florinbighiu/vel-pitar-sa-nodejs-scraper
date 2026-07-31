# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-31

### Added
- Initial release — derived from the [EPAM template](https://github.com/sebiboga/epam-systems-international-srl-nodejs-scraper)
- Job scraping from the velpitar.ro WordPress REST API (`/wp-json/wp/v2/posts`, category „Cariere" — id 211)
- Location mapping from WordPress categories to canonical Romanian cities (Brașov, București, Chitila, Cluj-Napoca, Giurgiu, Iași, Oradea, Pitești, Râmnicu Vâlcea)
- HTML/entity decoding of WordPress post titles (`&#8211;`, `&amp;`, etc.)
- Company validation via ANAF (CIF 21229091, VEL PITAR SA)
- Solr integration for job storage
- GitHub Actions workflows for daily scraping and testing
- Comprehensive test suite (unit, integration, E2E)
- ANAF API fallback with cached data support
- Node 24 compatibility

### Features
- Automated daily job scraping
- Company core validation and management
- Job URL validation
- Data integrity checks
- Romanian location filtering
- Work mode normalization

## License

Copyright (c) 2024-2026 BOGA SEBASTIAN-NICOLAE
Licensed under MIT License
