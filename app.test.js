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

    it('should return a 404 with an error message if there are no palettes for the specified query', async () => {
      const response = await request(app).get('/api/v1/palettes?color_1=blue')
        .expect(404);
      const { body } = response;
      expect(body).toHaveProperty('error');
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
      }).expect(201);
      const result = response.body;
      expect(result).toHaveProperty('id')
    });

    it('should return a 400 with a message if the project name already exists', async () => {
      const response = await request(app).post('/api/v1/projects').send({
        "name": "Movie-Tracker"
      }).expect(400);
      const result = response.body;
      expect(result).toHaveProperty('error');
    });

    it('should return a 422 if the name param does not exist with a message', async () => {
      const response = await request(app).post('/api/v1/projects').send({
        "noName": "STAR-theme"
      }).expect(422);
      const { body } = response;
      expect(body).toHaveProperty('error');
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

    it('should return a 422 if the expected params do not exist with a message', async () => {
      const response = await request(app).post('/api/v1/palettes').send({
        "name": "STAR-theme"
      }).expect(422);
      const { body } = response;
      expect(body).toHaveProperty('error');
    });

    it('should return a 400 if the palette does not exist with a message', async () => {
      const response = await request(app).post('/api/v1/palettes').send({
        "name": "fake palette",
        "color_1": "ff038d",
        "color_2": "2810aa",
        "color_3": "0923dn",
        "color_4": "asdjkn",
        "color_5": "as192a",
        "project_id": "0"
      }).expect(400);
      const { body } = response;
      expect(body).toHaveProperty('error');
    })
  });

  describe('PUT /api/v1/palettes/:id', () => {
    it('should update the palette for specified project and return a success message', async () => {
      const expectedPalette = await database('palettes').first();
      const { project_id, id } = expectedPalette;

      const response = await request(app).put(`/api/v1/palettes/${id}`).send({
        "name": "STAR-theme",
        "color_1": "ff038d",
        "color_2": "2810aa",
        "color_3": "0923dn",
        "color_4": "asdjkn",
        "color_5": "as192a",
        "project_id": `${project_id}`,
        "id": `${id}`
      }).expect(204);
      const results = await database('palettes').where('id', id);
      const [palette] = results;
      expect(palette.name).toEqual('STAR-theme');
    });

    it('should return a 422 if the required params do not exist with a message', async () => {
      const expectedPalette = await database('palettes').first();
      const { id } = expectedPalette;

      const response = await request(app).put(`/api/v1/palettes/${id}`).send({
        "name": "STAR-theme",
        "color_1": "ff038d",
        "color_2": "2810aa",
        "color_3": "0923dn",
        "color_4": "asdjkn",
        "color_5": "as192a"
      }).expect(422);
      const { body } = response;
      expect(body).toHaveProperty('error')
    });

    it('should return a 404 if the palette does not exist with a message', async () => {
      const expectedPalette = await database('palettes').first();
      const { project_id } = expectedPalette;

      const response = await request(app).put('/api/v1/palettes/0').send({
        "name": "STAR-theme",
        "color_1": "ff038d",
        "color_2": "2810aa",
        "color_3": "0923dn",
        "color_4": "asdjkn",
        "color_5": "as192a",
        "project_id": `${project_id}`,
        "id": "0"
      }).expect(404);
      const { body } = response;
      expect(body).toHaveProperty('error')
    });
  });

  describe('PUT /api/v1/projects/:id', () => {
    it('should update the project name and return a success message', async () => {
      const expectedProject = await database('projects').first();
      const { id } = expectedProject;

      await request(app).put(`/api/v1/projects/${id}`).send({
        "name": "MOVIEE-tracker"
      }).expect(204)
      const results = await database('projects').where('id', id);
      const [project] = results;
      expect(project.name).toEqual('MOVIEE-tracker')
    });

    it('should return a 422 if the name param does not exist with a message', async () => {
      const expectedProject = await database('projects').first();
      const { id } = expectedProject;

      const response = await request(app).put(`/api/v1/projects/${id}`).send({
        "naaame": "STAR-theme",
      }).expect(422);
      const { body } = response;
      expect(body).toHaveProperty('error')
    });

    it('should return a 404 if the project does not exist with an error message', async () => {
      const response = await request(app).put('/api/v1/projects/0').send({
        "name": "STAR-theme"
      }).expect(404);
      const { body } = response;
      expect(body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/palettes/:id', () => {
    it('should return a success message and a status of 200', async () => {
      const expectedPalette = await database('palettes').first();
      const { id } = expectedPalette;

      const response = await request(app).delete(`/api/v1/palettes/${id}`)
        .expect(200);
      const { body } = response;
      expect(body).toEqual(`Success! Your palette with the id ${id} has been deleted.`)
    });

    it('should return a 404 if the palette does not exist with an error message', async () => {
      const response = await request(app).delete('/api/v1/palettes/0')
        .expect(404);
      const { body } = response;
      expect(body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/projects/:id', () => {
    it('should return a success message and a status of 200', async () => {
      const expectedProject = await database('projects').first();
      const { id } = expectedProject;

      const response = await request(app).delete(`/api/v1/projects/${id}`)
        .expect(200);
      const { body } = response;
      expect(body).toEqual(`Success! Your project with the id ${id} has been deleted.`)
    });

    it('should return a 404 if the project does not exist with an error message', async () => {
      const response = await request(app).delete('/api/v1/projects/0')
        .expect(404);
      const { body } = response;
      expect(body).toHaveProperty('error');
    });
  });
});