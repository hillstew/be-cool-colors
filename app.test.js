const request = require('supertest');
const app = require('./app');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
import projects from './data';

describe('Server', () => {
  beforeEach(async () => {
    await database.seed.run();
  });

  describe('GET /api/v1/projects', () => {
    it('should return all projects in the DB', async () => {
      const numExpectedProjects = projects.length;
      const response = await request(app).get('/api/v1/projects')
        .expect(200);
      const result = response.body;
      expect(result.length).toEqual(numExpectedProjects);
    });
  });

  describe('GET /api/v1/palettes', () => {
    it('should return palette(s) that match the query param', async () => {
      const expectedPalettes = await database('palettes').where('name', 'random-theme');
      const expectedPalette = expectedPalettes[0];
      const { color_2 } = expectedPalette;
      const response = await request(app).get(`/api/v1/palettes?color_2=${color_2}`);
      const results = response.body;
      const palette = results[0];
      expect(palette.name).toEqual(expectedPalette.name)
    });

    it('should return all palettes if there is no query param', async () => {
      let numExpectedPalettes = 0;
      projects.forEach(project => {
        numExpectedPalettes += project.palettes.length
      });
      const response = await request(app).get('/api/v1/palettes')
        .expect(200);
      const result = response.body;
      expect(result.length).toEqual(numExpectedPalettes);
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should return the correct project', async () => {
      const expectedProject = await database('projects').first();
      const id = expectedProject.id;
      const response = await request(app).get(`/api/v1/projects/${id}`);
      const result = response.body[0];
      expect(result.name).toEqual(expectedProject.name);
    });
  });

  describe('GET /api/v1/projects/:id/palettes', () => {
    it('should return the palettes for a specific project in the database', async () => {
      const expectedProject = await database('projects').first();
      const { id } = projects[0];
      const expectedPalettes = expectedProject.palettes;
      const response = await request(app).get(`/api/v1/projects/${id}/palettes`);
      const result = response.body[0];
      expect(result).toEqual(expectedPalettes);
    });
  });

  describe('POST /api/v1/projects', () => {
    it('should return the id of the new posted project', async () => {
      const response = await request(app).post('/api/v1/projects').send({
        "name": "Palette Picker"
      });
      const result = response.body;
      expect(result).toHaveProperty('id')
    });
  });

  describe('POST /api/v1/palettes', () => {
    it('should return the id of the new posted palette', async () => {
      const expectedProject = await database('projects').first();
      const id = expectedProject.id;

      const response = await request(app).post('/api/v1/palettes').send({
        "name": "palette-theme",
        "color_1": "ff038d",
        "color_2": "2810aa",
        "color_3": "0923dn",
        "color_4": "asdjkn",
        "color_5": "as192a",
        "project_id": `${id}`
      });
      const result = response.body;
      expect(result).toHaveProperty('id');
    });


  });


});