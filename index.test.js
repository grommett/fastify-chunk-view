/* eslint-disable no-shadow */
import t from 'tap';
import Fastify from 'fastify';
import get from 'simple-get';
import fastifyChunkView, { NO_STRATEGY } from './index.js';
import { Readable } from 'stream';

t.test('reply.chunkView strings', t => {
  t.plan(6);
  const fastify = Fastify();
  const expected = '<html><head></head><body><p>test chunk</p></body></html>';
  let actual = '';

  fastify.register(fastifyChunkView);

  fastify.get('/', (_req, reply) => {
    reply.chunkView(['<html><head></head><body>', '<p>test chunk</p>', '</body></html>']);
  });

  fastify.listen(0, (err, address) => {
    t.error(err);

    get(
      {
        method: 'GET',
        url: address,
      },
      (err, response) => {
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8');
        t.equal(response.headers['transfer-encoding'], 'chunked');

        response.on('data', chunk => {
          actual += chunk.toString();
        });
        response.on('end', () => {
          t.equal(actual, expected);
        });
        fastify.close();
      }
    );
  });
});

t.test('reply.chunkView functions', t => {
  t.plan(6);
  const fastify = Fastify();
  const expected = '<html><head></head><body><p>Function chunk</p></body></html>';
  let actual = '';
  fastify.register(fastifyChunkView);

  fastify.get('/', (_req, reply) => {
    reply.chunkView([
      () => '<html><head></head><body>',
      () => '<p>Function chunk</p>',
      () => '</body></html>',
    ]);
  });

  fastify.listen(0, (err, address) => {
    t.error(err);

    get(
      {
        method: 'GET',
        url: address,
      },
      (err, response) => {
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8');
        t.equal(response.headers['transfer-encoding'], 'chunked');

        response.on('data', chunk => {
          actual += chunk.toString();
        });
        response.on('end', () => {
          t.equal(actual, expected);
        });
        fastify.close();
      }
    );
  });
});

t.test('reply.chunkView async function', t => {
  t.plan(6);
  const fastify = Fastify();
  const expected = '<html><head></head><body><p>Async chunk</p></body></html>';
  let actual = '';
  fastify.register(fastifyChunkView);

  fastify.get('/', (_req, reply) => {
    reply.chunkView([
      () => Promise.resolve('<html><head></head><body>'),
      () => Promise.resolve('<p>Async chunk</p>'),
      () => Promise.resolve('</body></html>'),
    ]);
  });

  fastify.listen(0, (err, address) => {
    t.error(err);

    get(
      {
        method: 'GET',
        url: address,
      },
      (err, response) => {
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8');
        t.equal(response.headers['transfer-encoding'], 'chunked');

        response.on('data', chunk => {
          actual += chunk.toString();
        });
        response.on('end', () => {
          t.equal(actual, expected);
        });
        fastify.close();
      }
    );
  });
});

t.test('reply.chunkView readStreams', t => {
  t.plan(6);
  const fastify = Fastify();
  const startStream = Readable.from('<html><body>');
  const contentStream = Readable.from('<p>Content</p>');
  const endStream = Readable.from('</body></html>');
  const expected = `<html><body><p>Content</p></body></html>`;

  let actual = '';
  fastify.register(fastifyChunkView);

  fastify.get('/', (_req, reply) => {
    reply.chunkView([startStream, contentStream, endStream]);
  });

  fastify.listen(0, (err, address) => {
    t.error(err);

    get(
      {
        method: 'GET',
        url: address,
      },
      (err, response) => {
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8');
        t.equal(response.headers['transfer-encoding'], 'chunked');

        response.on('data', chunk => {
          actual += chunk.toString();
        });
        response.on('end', () => {
          t.equal(actual, expected);
        });
        fastify.close();
      }
    );
  });
});

t.test('reply.chunkView mixed strings function and async function & Readable', t => {
  t.plan(6);
  const fastify = Fastify();
  const contentStream = Readable.from('<p>Content</p>');
  const expected = `<html><head></head><body><p>Async chunk</p><p>Content</p></body></html>`;
  let actual = '';
  fastify.register(fastifyChunkView);

  fastify.get('/', (_req, reply) => {
    reply.chunkView([
      '<html><head></head><body>',
      () => Promise.resolve('<p>Async chunk</p>'),
      contentStream,
      () => '</body></html>',
    ]);
  });

  fastify.listen(0, (err, address) => {
    t.error(err);

    get(
      {
        method: 'GET',
        url: address,
      },
      (err, response) => {
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8');
        t.equal(response.headers['transfer-encoding'], 'chunked');

        response.on('data', chunk => {
          actual += chunk.toString();
        });
        response.on('end', () => {
          t.equal(actual, expected);
        });
        fastify.close();
      }
    );
  });
});

t.test('reply.chunkView defaults to NO_STRATEGY when chunk has no strategy for rendering', t => {
  t.plan(6);
  const fastify = Fastify();
  const expected = NO_STRATEGY;
  let actual = '';
  fastify.register(fastifyChunkView);

  fastify.get('/', (_req, reply) => {
    reply.chunkView([new Map()]);
  });

  fastify.listen(0, (err, address) => {
    t.error(err);

    get(
      {
        method: 'GET',
        url: address,
      },
      (err, response) => {
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8');
        t.equal(response.headers['transfer-encoding'], 'chunked');

        response.on('data', chunk => {
          actual += chunk.toString();
        });
        response.on('end', () => {
          t.equal(actual, expected);
        });
        fastify.close();
      }
    );
  });
});
t.test('reply.chunkView function error handling', t => {
  t.plan(6);
  const fastify = Fastify();
  const expected = '<html><head></head><body><p>Async chunk</p>';
  let actual = '';
  fastify.register(fastifyChunkView);

  fastify.get('/', (_req, reply) => {
    reply.chunkView([
      '<html><head></head><body>',
      () => Promise.resolve('<p>Async chunk</p>'),
      function () {
        throw new Error('Function error');
      },
    ]);
  });

  fastify.listen(0, (err, address) => {
    t.error(err);

    get(
      {
        method: 'GET',
        url: address,
      },
      (err, response) => {
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8');
        t.equal(response.headers['transfer-encoding'], 'chunked');

        response.on('data', chunk => {
          actual += chunk.toString();
        });
        response.on('end', () => {
          t.equal(actual, expected);
        });
        fastify.close();
      }
    );
  });
});

t.test('reply.chunkView Promise reject error handling', t => {
  t.plan(6);
  const fastify = Fastify();
  const expected = '<html><head></head><body><p>Async chunk</p>';
  let actual = '';
  fastify.register(fastifyChunkView);

  fastify.get('/', (_req, reply) => {
    reply.chunkView([
      '<html><head></head><body>',
      () => Promise.resolve('<p>Async chunk</p>'),
      () => Promise.reject(new Error('Promise error')),
    ]);
  });

  fastify.listen(0, (err, address) => {
    t.error(err);

    get(
      {
        method: 'GET',
        url: address,
      },
      (err, response) => {
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8');
        t.equal(response.headers['transfer-encoding'], 'chunked');

        response.on('data', chunk => {
          actual += chunk.toString();
        });
        response.on('end', () => {
          t.equal(actual, expected);
        });
        fastify.close();
      }
    );
  });
});

t.test('reply.chunkView Readable error handling', t => {
  t.plan(6);
  const fastify = Fastify();
  const expected = '<html><head></head><body>';
  let actual = '';
  class ErrorReadable extends Readable {
    _read() {
      this.destroy(new Error('Readable error'));
    }

    _destroy(err, callback) {
      callback(err);
    }
  }

  fastify.register(fastifyChunkView);

  fastify.get('/', (_req, reply) => {
    reply.chunkView(['<html><head></head><body>', new ErrorReadable()]);
  });

  fastify.listen(0, (err, address) => {
    t.error(err);

    get(
      {
        method: 'GET',
        url: address,
      },
      (err, response) => {
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8');
        t.equal(response.headers['transfer-encoding'], 'chunked');

        response.on('data', chunk => {
          actual += chunk.toString();
        });
        response.on('end', () => {
          t.equal(actual, expected);
        });
        fastify.close();
      }
    );
  });
});
