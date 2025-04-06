import { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "../utils/jwt";
import { TokenPayload } from "../interfaces/TokenPayload.interface";

/**
 * Auth middleware
 * Attach the user information to the request on success
 * 
 * @param request: FastifyRequest
 * @param reply: FastifyReply
 * @returns void
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({ error: "Missing authorization header!" });
    }
    // Extract the token (Bearer <token>)
    const token = authHeader.split(" ")[1];

    if (!token) {
      return reply.status(401).send({ error: "Token is missing or invalid!" });
    }

    // Verify the token
    const tokenPayload = verifyToken(token) as TokenPayload;

    // Attach the user information to the request
    (request as FastifyRequest & { user?: TokenPayload }).user = tokenPayload;
  } catch (error) {
    reply.status(401).send({ error: "Authentication failed!" });
  }
}