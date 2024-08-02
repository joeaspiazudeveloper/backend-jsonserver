const jsonServer = require("json-server");
const cors = require("cors");
const path = require("path");
const fs = require('fs');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "", "db.json"));
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(jsonServer.bodyParser);
server.use(middlewares);

server.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    req.body.createdAt = Date.now();
    req.body.id = Date.now().toString();

    fs.readFile('./db.json', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error reading db.json');
      }

      const json = JSON.parse(data);
      json.products.push(req.body);

      fs.writeFile('./db.json', JSON.stringify(json), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error writing db.json');
        }

        next();
      });
    });
  } else {
    next();
  }
});

server.use(jsonServer.rewriter({
  '/api/*': '/$1',
  '/blog/:resource/:id/show': '/:resource/:id'
}));
server.use(router);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
});
