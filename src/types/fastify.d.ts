import "fastify";
import { TokenPayload } from "../interfaces/TokenPayload.interface";

/**
 * Extending FastifyRequest interface from the module "fastify" to attach custom properties
 */
declare module "fastify" {
  interface FastifyRequest {
    user?: TokenPayload,
    services?: {
      comparePassword: (password: string, hash: string) => Promise<boolean>;
      generateToken: (userId: number) => string;
    };
  }
}