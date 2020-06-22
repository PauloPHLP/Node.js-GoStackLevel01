const express = require('express');
const cors = require('cors');
const { uuid, isUuid } = require('uuidv4');

const app = express();
const projects = [];

app.use(cors());

function logRequests(req, resp, next) {
  const { method, url } = req;
  const logLabel = `[${method.toUpperCase()}]: ${url}`;

  console.time(logLabel);

  next();

  console.timeEnd(logLabel);
};

function validateProjectId(req, resp, next) {
  const { id } = req.params;

  if (!isUuid(id)) return resp.status(400).json({ error: 'Invalid project id.' });

  return next();
};

app.use(express.json());
app.use(logRequests);
app.use('/projects/:id', validateProjectId);

app.get('/projects', (req, resp) => {
  const { title } = req.query;
  const results = title 
    ? projects.filter((project) => project.title.toLowerCase().includes(title.toLowerCase())) 
    : projects;

  return resp.json(results);
});

app.post('/projects', (req, resp) => {
  const { title, owner } = req.body;
  const project = { id: uuid(), title, owner };

  projects.push(project);

  return resp.json(project);
});

app.put('/projects/:id', (req, resp) => {
  const { id } = req.params;
  const { title, owner } = req.body;
  const projectIndex = projects.findIndex((project) => project.id === id);

  if (projectIndex < 0) return resp.status(400).json({ 
    error: `Project with id ${id} not found!` 
  });

  const project = {
    id,
    title,
    owner
  };

  projects[projectIndex] = project;

  return resp.json(project);
});

app.delete('/projects/:id', (req, resp) => {
  const { id } = req.params;

  const projectIndex = projects.findIndex((project) => project.id === id);

  if (projectIndex < 0) return resp.status(400).json({ 
    error: `Project with id ${id} not found!` 
  });

  projects.splice(projectIndex, 1);

  return resp.status(204).send();
});

app.listen(3333, () => {
  console.log("Application started! 😎️");
});
