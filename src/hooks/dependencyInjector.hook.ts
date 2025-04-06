import { FastifyInstance, FastifyRequest } from "fastify";
import { comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";

/**
 * Managing dependencies and dynamic configuration
 * 
 * @param fastify: FastifyInstance
 */
export default async function dependencyInjectorHook(fastify: FastifyInstance) {
  fastify.addHook("preHandler", async (request: FastifyRequest) => {
    request.services = {
      comparePassword,
      generateToken,
    };
  });
}