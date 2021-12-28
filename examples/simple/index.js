import Fastify from 'fastify';
import fastifyChunkView from '../../index.js';

const fastify = Fastify();

fastify.register(fastifyChunkView, {});

fastify.get('/', (req, reply) => {
  reply.chunkView([
    `<html><head></head><body>`,
    function () {
      return `<h1>Hello chunked view</h1>`;
    },
    function () {
      return new Promise((resolve, _reject) => {
        setTimeout(() => {
          resolve(`<p>This is async content</p>`);
        }, 1000);
      });
    },
    `<footer>${new Date().toLocaleDateString()}</footer></body></html>`,
  ]);
});

fastify.listen(3000, err => {
  if (err) throw err;
  console.log(`server listening on ${fastify.server.address().port}`);
});
