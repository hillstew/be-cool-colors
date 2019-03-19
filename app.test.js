import request from 'supertest';
import app from './app';
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

    it.skip('should return a 500 response error', async () => {});
  });

  describe('GET /api/v1/palettes?', () => {
    it('should return a palettes that match the query param', async () => {
      const expectedPalettes = await database('palettes').where('name', 'random-theme');
      const expectedPalette = expectedPalettes[0];
      const { color_2 } = expectedPalette;
      const response = await request(app).get(`/api/v1/palettes?color_2=${color_2}`);
      const results = response.body;
      const palette = results[0];
      expect(palette.name).toEqual(expectedPalette.name)
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


});