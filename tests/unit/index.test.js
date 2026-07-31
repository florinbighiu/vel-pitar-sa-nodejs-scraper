describe('index.js Component Tests', () => {
  let index;

  beforeAll(async () => {
    index = await import('../../scraper/index.js');
  });

  describe('transformJobsForSOLR', () => {
    it('should filter locations to only Romanian cities', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', location: ['România'] },
          { url: 'https://test.com/2', title: 'Job 2', location: ['Bucharest'] },
          { url: 'https://test.com/3', title: 'Job 3', location: ['Bulgaria'] },
          { url: 'https://test.com/4', title: 'Job 4', location: ['Cluj-Napoca'] },
          { url: 'https://test.com/5', title: 'Job 5', location: [] }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].location).toEqual(['România']);
      expect(result.jobs[1].location).toEqual(['Bucharest']);
      expect(result.jobs[2].location).toEqual(['România']);
      expect(result.jobs[3].location).toEqual(['Cluj-Napoca']);
      expect(result.jobs[4].location).toEqual(['România']);
    });

    it('should keep company uppercase', () => {
      const payload = {
        source: 'velpitar.ro',
        company: 'vel pitar sa',
        cif: '21229091',
        jobs: [
          { url: 'https://velpitar.ro/test/1', title: 'Job 1', company: 'vel pitar sa', cif: '21229091' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.company).toBe('VEL PITAR SA');
    });

    it('should normalize workmode values', () => {
      const payload = {
        jobs: [
          { url: 'https://test.com/1', title: 'Job 1', workmode: 'Remote' },
          { url: 'https://test.com/2', title: 'Job 2', workmode: 'ON-SITE' },
          { url: 'https://test.com/3', title: 'Job 3', workmode: 'Hybrid' },
          { url: 'https://test.com/4', title: 'Job 4', workmode: 'hybrid' }
        ]
      };

      const result = index.transformJobsForSOLR(payload);

      expect(result.jobs[0].workmode).toBe('remote');
      expect(result.jobs[1].workmode).toBe('on-site');
      expect(result.jobs[2].workmode).toBe('hybrid');
      expect(result.jobs[3].workmode).toBe('hybrid');
    });

    it('should handle empty jobs array', () => {
      const result = index.transformJobsForSOLR({ jobs: [] });
      expect(result.jobs).toEqual([]);
    });
  });

  describe('mapToJobModel', () => {
    it('should map raw job to job model format', () => {
      const rawJob = {
        url: 'https://velpitar.ro/brutar-brasov/',
        title: 'Brutar – Brașov',
        location: ['Brașov'],
        tags: ['brasov'],
        workmode: 'on-site'
      };

      const COMPANY_NAME = 'VEL PITAR SA';
      const COMPANY_CIF = '21229091';

      const result = index.mapToJobModel(rawJob, COMPANY_CIF, COMPANY_NAME);

      expect(result.url).toBe(rawJob.url);
      expect(result.title).toBe(rawJob.title);
      expect(result.company).toBe(COMPANY_NAME);
      expect(result.cif).toBe(COMPANY_CIF);
      expect(result.location).toEqual(rawJob.location);
      expect(result.tags).toEqual(rawJob.tags);
      expect(result.workmode).toBe(rawJob.workmode);
      expect(result.status).toBe('scraped');
      expect(result.date).toBeDefined();
    });

    it('should remove undefined fields', () => {
      const rawJob = {
        url: 'https://velpitar.ro/test/1',
        title: 'Job 1'
      };

      const result = index.mapToJobModel(rawJob, '21229091');

      expect(result.location).toBeUndefined();
      expect(result.tags).toBeUndefined();
      expect(result.workmode).toBeUndefined();
    });

    it('should handle missing title', () => {
      const rawJob = { url: 'https://velpitar.ro/test/1' };

      const result = index.mapToJobModel(rawJob, '21229091');

      expect(result.title).toBeUndefined();
      expect(result.url).toBe('https://velpitar.ro/test/1');
    });
  });

  describe('parseApiJobs', () => {
    const CATEGORIES = [
      { id: 211, slug: 'cariere', name: 'Cariere' },
      { id: 248, slug: 'brasov', name: 'Brasov' },
      { id: 250, slug: 'cluj', name: 'Cluj' },
      { id: 273, slug: 'oradea', name: 'Oradea' },
      { id: 1, slug: 'fara-categorie', name: 'Fără categorie' }
    ];

    it('should parse WordPress REST API response format', () => {
      const apiData = {
        total: 1,
        posts: [
          {
            id: 9914,
            link: 'https://velpitar.ro/sofer-distributie-brasov/',
            title: { rendered: 'Șofer distributie &#8211; Brașov' },
            categories: [248, 211]
          }
        ]
      };

      const result = index.parseApiJobs(apiData, CATEGORIES);

      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0].title).toBe('Șofer distributie – Brașov');
      expect(result.jobs[0].url).toBe('https://velpitar.ro/sofer-distributie-brasov/');
      expect(result.jobs[0].uid).toBe('9914');
      expect(result.jobs[0].location).toEqual(['Brașov']);
      expect(result.jobs[0].tags).toEqual(['brasov']);
    });

    it('should map multiple city categories to canonical Romanian cities', () => {
      const apiData = {
        total: 1,
        posts: [
          {
            id: 1,
            link: 'https://velpitar.ro/job/',
            title: { rendered: 'Job' },
            categories: [250, 248]
          }
        ]
      };

      const result = index.parseApiJobs(apiData, CATEGORIES);

      expect(result.jobs[0].location).toEqual(['Cluj-Napoca', 'Brașov']);
    });

    it('should ignore non-city categories in location', () => {
      const apiData = {
        total: 1,
        posts: [
          {
            id: 1,
            link: 'https://velpitar.ro/job/',
            title: { rendered: 'Job' },
            categories: [211, 1, 248]
          }
        ]
      };

      const result = index.parseApiJobs(apiData, CATEGORIES);

      expect(result.jobs[0].location).toEqual(['Brașov']);
    });

    it('should strip HTML tags and decode entities from title', () => {
      const apiData = {
        total: 1,
        posts: [
          {
            id: 1,
            link: 'https://velpitar.ro/job/',
            title: { rendered: '<strong>Brutar</strong> &amp; Patiser &#8211; Cluj' },
            categories: [250]
          }
        ]
      };

      const result = index.parseApiJobs(apiData, CATEGORIES);

      expect(result.jobs[0].title).toBe('Brutar & Patiser – Cluj');
    });

    it('should handle empty job list', () => {
      const result = index.parseApiJobs({ posts: [], total: 0 });

      expect(result.jobs).toEqual([]);
    });

    it('should handle missing posts field', () => {
      const result = index.parseApiJobs({});

      expect(result.jobs).toEqual([]);
    });

    it('should handle post with missing fields', () => {
      const apiData = {
        total: 1,
        posts: [{ id: 1 }]
      };

      const result = index.parseApiJobs(apiData, CATEGORIES);

      expect(result.jobs[0].title).toBe('');
      expect(result.jobs[0].location).toEqual([]);
      expect(result.jobs[0].tags).toEqual([]);
    });

    it('should handle unknown category ids without location', () => {
      const apiData = {
        total: 1,
        posts: [
          {
            id: 1,
            link: 'https://velpitar.ro/job/',
            title: { rendered: 'Job' },
            categories: [999]
          }
        ]
      };

      const result = index.parseApiJobs(apiData, CATEGORIES);

      expect(result.jobs[0].location).toEqual([]);
    });
  });

  describe('URL Generation', () => {
    it('should use the WordPress post link directly as job URL', () => {
      const apiData = {
        total: 1,
        posts: [
          {
            id: 9914,
            link: 'https://velpitar.ro/sofer-distributie-brasov/',
            title: { rendered: 'Șofer distributie – Brașov' },
            categories: [248, 211]
          }
        ]
      };

      const result = index.parseApiJobs(apiData);

      expect(result.jobs[0].url).toBe('https://velpitar.ro/sofer-distributie-brasov/');
    });
  });
});
