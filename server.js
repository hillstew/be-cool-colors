const express = require('express')
const app = express();

app.set('port', process.env.PORT || 3001)

app.listen(app.get('port'), () => {
  console.log(`App is running on http://localhost:${app.get('port')}.`)
})


const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.get('api/v1/project', (req, res) => {
  database('projects').select()
    .then(projects => res.status(200).json(projects))
    .catch(error => res.status(500).json({ error }))
})
