import Fastify from 'fastify';
import fs from 'fs';
import fastifyChunkView from '../../index.js';

const fastify = Fastify();

fastify.register(fastifyChunkView, {});

fastify.get('/', (req, reply) => {
  reply.chunkView([
    fs.createReadStream('start.html'),
    fs.createReadStream('content.html'),
    `<p>Text in the middle</p>`,
    function () {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(`<p>This is async content</p>`);
        }, 1000);
      });
    },
    fs.createReadStream('end.html'),
  ]);
});

fastify.listen(3000, err => {
  if (err) throw err;
  // eslint-disable-next-line no-console
  console.log(`server listening on ${fastify.server.address().port}`);
});
