import Fastify from 'fastify';
import defaultRoutes from '../src/routes/default.route';
import userRoutes from '../src/routes/user.route';
import tweetRoutes from '../src/routes/tweet.route';
import { expect } from 'chai';

const buildTestServer = () => {
  const fastify = Fastify({ logger: false, ignoreTrailingSlash: true });

  // Register routes
  fastify.register(defaultRoutes, { prefix: '/api' });
  fastify.register(userRoutes, { prefix: '/api' });
  fastify.register(tweetRoutes, { prefix: '/api' });

  return fastify;
};

describe('Fastify Server Integration Tests', () => {
  let fastify: any;

  before(async () => {
    fastify = buildTestServer();
    await fastify.ready();
  });

  after(async () => {
    await fastify.close();
  });

  it('Default route responds with 200 status', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api',
    });

    expect(response.statusCode).to.equal(200);
    expect(response.json()).to.have.property('message');
  });
});