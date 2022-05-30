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
    productList,
    productList, // Add it a second time to see the delay & render
    `<footer>${new Date().toLocaleDateString()}</footer></body></html>`,
  ]);
});

async function productList() {
  const products = await getProducts();
  return `
      <ul>
        ${products.map(product => `<li>${product.name}</li>`).join('')}
      </ul>`;
}

function getProducts() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([{ name: 'Product 1' }, { name: 'Product 2' }, { name: 'Product 3' }]);
    }, 1000);
  });
}

fastify.listen(3000, err => {
  if (err) throw err;
  // eslint-disable-next-line no-console
  console.log(`server listening on ${fastify.server.address().port}`);
});
