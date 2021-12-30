import { Readable } from 'stream';
import fastifyPlugin from 'fastify-plugin';

export const NO_STRATEGY = `<!--  No strategy found for chunk -->`;

function fastifyChunkView(fastify, _opts, next) {
  fastify.decorateReply('chunkView', chunkView);
  next();
}

/**
 * Creates and sends the response to the client.
 * Given an array of chunks will push each to the response stream in given order
 * @param {(string|() => string| () => Promise<string>)[]} chunks
 * @returns {void}
 */
async function chunkView(chunks) {
  const responseStream = getReadStream();
  this.header('content-type', 'text/html');
  this.header('transfer-encoding', 'chunked');
  this.send(responseStream);

  try {
    for (const chunk of chunks) {
      let result;
      const nextChunk = getChunk(chunk, responseStream);
      if (nextChunk.then) {
        result = await nextChunk;
      } else {
        result = nextChunk;
      }
      responseStream.push(result);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  responseStream.push(null);
}

/**
 * Returns the chunk
 * @param {Readable|string|Function} chunk
 * @param {Readable} responseStream
 * @returns {string|Promise<string>}
 */
function getChunk(chunk, responseStream) {
  const strategy = getChunkStrategy(chunk, responseStream);
  return strategy();
}

/**
 * Evaluates the chunk type and returns the strategy to call for this type of chunk
 * @param {Readable|string|() => string} chunk A Readable Stream to be pushed into the response stream,
 * a string to push into the response stream or function that returns a string
 * @param {Readable} responseStream A Readable Stream
 * @returns {() => string|() => Promise<string>}
 */
function getChunkStrategy(chunk, responseStream) {
  if (typeof chunk === 'string') return () => chunk;
  if (typeof chunk === 'function') return chunk;
  if (chunk instanceof Readable) return handleReadStream(responseStream, chunk);
  return () => NO_STRATEGY;
}

/**
 * Pushes a read stream into the response read stream
 * Resolves once the readStream is complete
 * @param {Readable} responseStream
 * @param {Readable} readStream
 * @returns {() => Promise<string>}
 */
function handleReadStream(responseStream, readStream) {
  return () =>
    new Promise((resolve, reject) => {
      readStream.on('data', data => {
        responseStream.push(data);
      });
      readStream.on('end', () => {
        resolve('');
      });
      readStream.on('error', error => {
        reject(error);
      });
    });
}

/**
 * Gets a Readable stream setting its `_read` method
 * @returns {Readable} Readable
 */
function getReadStream() {
  const stream = new Readable();
  // eslint-disable-next-line no-empty-function
  stream._read = () => {};
  return stream;
}

export default fastifyPlugin(fastifyChunkView, {
  fastify: '3.x',
  name: 'chunk-view',
});
