const express = require('express');
const app = express();
const cors = require('cors');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
app.use(cors());
app.use(express.json());

app.get('/api/v1/projects', (req, res) => {
  database('projects')
    .select()
    .then(projects => res.status(200).json(projects))
    .catch(error => {
      res.status(500).json({ error });
    });
});

app.get('/api/v1/palettes', (req, res) => {
  const paramKeys = Object.keys(req.query);
  if (paramKeys.length) {
    database('palettes')
      .select()
      .where(req.query)
      .then(palettes => {
        if (palettes.length) {
          res.status(200).json(palettes);
        } else {
          res.status(404).json({
            error: `There are no palettes for ${paramKeys[0]} with the value of ${req.query[paramKeys[0]]}`
          });
        }
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    database('palettes')
      .select()
      .then(palettes => res.status(200).json(palettes))
      .catch(error => res.status(500).json({ error }));
  }
});

app.get('/api/v1/projects/:id', (req, res) => {
  const { id } = req.params;
  database('projects')
    .where('id', parseInt(id))
    .then(project => res.status(200).json(project))
    .catch(error => res.status(500).json({ error }));
});

app.get('/api/v1/projects/:id/palettes', (req, res) => {
  const { id } = req.params;
  database('palettes')
    .where('project_id', parseInt(id))
    .then(palettes => res.status(200).json(palettes))
    .catch(error => res.status(500).json({ error }));
});

app.post('/api/v1/projects', (req, res) => {
  let project = req.body;

  if (!project.name) {
    return res.status(422).json({
      error: 'You are missing a name property for this project'
    });
  }

  database('projects')
    .where('name', project.name)
    .then(projects => {
      if (projects.length >= 1) {
        return res.status(400).json({
          error: `A project with the name ${project.name} already exists.`
        });
      }
      database('projects')
        .insert(project, 'id')
        .then(project => res.status(201).json({ id: project[0] }))
      })
    .catch(error => res.status(500).json({ error }));
});

app.post('/api/v1/palettes', (req, res) => {
  const palette = req.body;
  let requiredParams = ['name', 'color_1', 'color_2', 'color_3', 'color_4', 'color_5', 'project_id'];

  requiredParams.forEach(param => {
    if (!palette[param]) {
      return res.status(422).send({
        error: `Expected format: { name: <String>, color_1: <String>, color_2: <String>, color_3: <String>, color_4: <String>, color_5: <String>, project_id: <Integer>}. You are missing a "${param}" property.`
      });
    }
  });

  database('projects')
    .where('id', palette.project_id)
    .then(projectIds => {
      if (!projectIds.length) {
        return res.status(400).json({
          error: `${palette.project_id} does not exist, unable to add palette`
        });
      }
      database('palettes')
        .insert(palette, 'id')
        .then(palette => res.status(201).json({ id: palette[0] }))
        .catch(error => res.status(500).json({ error }));
    });
});

app.put('/api/v1/palettes/:id', (req, res) => {
  const palette = req.body;
  const { name, color_1, color_2, color_3, color_4, color_5, project_id } = palette;
  const paletteId = parseInt(req.params.id);
  let requiredParams = ['name', 'color_1', 'color_2', 'color_3', 'color_4', 'color_5', 'project_id'];
  requiredParams.forEach(param => {
    if (!palette[param]) {
      return res.status(422).send({
        error: `Expected format: { name: <String>, color_1: <String>, color_2: <String>, color_3: <String>, color_4: <String>, color_5: <String>, project_id: <Integer>}. You are missing a "${param}" property.`
      });
    }
  });

  let paletteFound = false;
  database('palettes')
    .select()
    .then(palettes => {
      palettes.forEach(palette => {
        if (palette.id === paletteId) {
          paletteFound = true;
        }
      });

      if (!paletteFound) {
        return res.status(404).send({ error: 'That palette does not exist, unable to update.' });
      } else {
        database('palettes')
          .where('id', paletteId)
          .update({
            name,
            color_1,
            color_2,
            color_3,
            color_4,
            color_5,
            project_id
          })
          .then(() => res.sendStatus(204))
          .catch(error => res.status(500).json({ error }));
      }
    });
});

app.put('/api/v1/projects/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  if (!name) {
    return res.status(422).send({
      error: 'You are missing a name property for this project'
    });
  }

  let projectFound = false;
  database('projects')
    .select()
    .then(projects => {
      projects.forEach(project => {
        if (project.id === parseInt(id)) {
          projectFound = true;
        }
      });

      if (!projectFound) {
        return res.status(404).send({
          error: 'That project does not exist, unable to update.'
        });
      } else {
        database('projects')
          .where('id', id)
          .update({ name })
          .then(() => res.sendStatus(204))
          .catch(error => res.status(500).json({ error }));
      }
    });
});

app.delete('/api/v1/palettes/:id', (req, res) => {
  const { id } = req.params;

  database('palettes')
    .where('id', id)
    .del()
    .then(palette => {
      if (palette === 1) {
        return res.status(200).json(`Success! Your palette with the id ${id} has been deleted.`);
      } else {
        return res.status(404).send({ error: 'That palette does not exist, unable to delete.'});
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
});

app.delete('/api/v1/projects/:id', (req, res) => {
  const { id } = req.params;

  database('palettes')
    .where('project_id', id)
    .del()
    .then(() => {
      database('projects')
        .where('id', id)
        .del()
        .then(project => {
          if (project === 1) {
            return res.status(200).json(`Success! Your project with the id ${id} has been deleted.`);
          } else {
            return res.status(404).send({ error: 'That project does not exist, unable to delete.'});
          }
        });
    })
    .catch(error => {
      res.status(500).json({ error });
    });
});

module.exports = app;
