# Chunk View

<a href="https://github.com/grommett/fastify-chunk-view/actions/workflows/ci.yaml"><img src="https://github.com/grommett/fastify-chunk-view/workflows/CI/badge.svg" /></a>
![Known Vulnerabilities](https://snyk.io/test/github/grommett/fastify-chunk-view/badge.svg)



A Fastify plugin for sending HTML content to the client as soon as it becomes available.

## Why

This plugin is ideal for situations where you have static content that can be served immediatley and async content that will arrive later. For example, a product list page where the header, styles and hero image can be sent right away while you grab the products from an API.

## Usage

The `chunk-view` plugin takes an array of chunks and sends them to the client in order. A chunk in this sense can be a `string`, a `function` that returns a `string`, an `async function` that returns a `string` or a `Readable` stream.

Have a look or run the `examples` folder in this repo for mre details, but here's a silly example to illustate:

```js
fastify.get('/', (_req, reply) => {
  reply.chunkView([
    '<p>test chunk 1</p>',
    '<p>test chunk 2</p>'
  ]);
});
```

In the example above each chunk is pushed into the `reply`'s read stream in order.

An example of the ecommerce use case mentioned above:

```js
fastify.get('/', (_req, reply) => {
  reply.chunkView([
    '<html><head></head><body>',
    productList,
    footer,
    '</body></html>'
  ]);
});

async function productList() {
  const products = await getProdcucts();
  return `
      <ul>
        ${products.map(product => `<li>${product.name}</li>`).join('')}
      </ul>`;
}

function footer() {
  return `<footer>${new Date().toLocaleDateString()}</footer>`;
}
```

You probably wouldn't use the same strings over and over in your routes. This plugin also lets you use [`Readable`](https://nodejs.org/api/stream.html#readable-streams) streams.

Building on the product list example above:

```js
fastify.get('/', (_req, reply) => {
  const startHTML = fs.createReadStream('start.html');
  const endHTML = fs.createReadStream('end.html');

  reply.chunkView([
    startHTML,
    productList,
    footer,
    endHTML
  ]);
});

async function productList() {
  const products = await getProducts();
  return `
      <ul>
        ${products.map(product => `<li>${product.name}</li>`).join('')}
      </ul>`;
}

function footer() {
  return `<footer>${new Date().toLocaleDateString()}</footer>`;
}
```

## Further Reading
- [The Lost Art of Progressive HTML Rendering](https://blog.codinghorror.com/the-lost-art-of-progressive-html-rendering/)
- [Rediscovering Progressive HTML Rendering with Marko](https://tech.ebayinc.com/engineering/async-fragments-rediscovering-progressive-html-rendering-with-marko/)
- [Progressive Rendering — The Key to Faster Web](https://medium.com/the-thinkmill/progressive-rendering-the-key-to-faster-web-ebfbbece41a4)

