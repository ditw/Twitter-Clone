import {FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export default async function defaultRoutes(fastify: FastifyInstance) {
 fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    return { message: 'Fastify with TypeScript!' };
  });
}
