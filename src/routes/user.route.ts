import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { UserService } from '../services/user.service';
import dotenv from "dotenv";
import { authenticate } from "../middlewares/auth.middleware";
import { Validation } from "../utils/validate";

dotenv.config();

export default async function authRoutes(fastify: FastifyInstance) {
  /**
   * Registration route
   */
  fastify.post("/register", async (request, reply) => {
    // Validate request body
    const validateErrorMessage = Validation.validateRequestBody(request.body, ['username', 'email', 'password']);
    // Error request body
    if (validateErrorMessage) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: validateErrorMessage,
      });
    }    

    const { username, email, password } = request.body as any;

    try {
      // Validate email (must be valid)
      if (!Validation.isValidEmail(email)) {
        return reply.status(400).send({ error: "Invalid email format!" });
      }
      // Validate username (must be unique and not empty)
      if (!Validation.isValidUsername(username)) {
        return reply.status(400).send({ error: "Invalid username! Must contain only alphanumeric characters and cannot be empty." });
      }
      // Validate password (must not be empty and contains at least 6 characters with combination of alphanumeric and special characters )
      if (!Validation.isValidPassword(password)) {
        return reply.status(400).send({ error: "Invalid password! Must be at least 6 characters long and include letters, numbers, and special characters." });
      }
      // Email must be unique
      if (await UserService.findByEmail(email)) {
        return reply.status(400).send({ error: "Email already exists!" });
      }
      // Username must be unique
      if (await UserService.findByUserName(username)) {
        return reply.status(400).send({ error: "Username already exists!" });
      }
      const user = await UserService.createUser(username, email, password);
      return reply.status(201).send({ id: user.id, email: user.email });
    } catch (error) {
      return reply.status(500).send({ error: (error as Error).message });
    }
  });

  /**
   * Login route
   */
  fastify.post("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    // Validate request body
    const validateErrorMessage = Validation.validateRequestBody(request.body, ['userRef', 'password']);
    // Error request body
    if (validateErrorMessage) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: validateErrorMessage,
      });
    }
    // Add this to use it in test cases (with no-null assertion) - using in unit tests
    const { comparePassword, generateToken } = request.services!;
    // Request body
    const { userRef, password } = request.body as any;

    // User can be authenticated via either username or email, and password
    const user = await UserService.findByUserNameOrEmail(userRef);
    if (!user || !(await comparePassword(password, user.password))) {
      // Statement can be more description by splitting the conditions to check whether the error comes from creds or the user blockage
      return reply.status(401).send({ error: "Invalid credentials or user is not active!" });
    }
    const token = generateToken(user.id);

    return reply.send({ 'message': 'Successfully logged in.', token });
  });

  /**
   * Route for search for users by username (as part of tagging functionality)
   */
  fastify.get("/users/search", { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Page as a default value of 1
    const { q, page = 1 } = request.query as { q: string; page:number };
    const limit = process.env.DEFAULT_PAGINATION_LIMIT || 20; 

    try {
      // Ensure the query exists and is valid
      if (!q || q.length < 3) {
        return reply.status(400).send({ error: "Search keyword must contain at least 3 characters!" });
      }

      const users = await UserService.searchUsersByUsername(q, Number(page), Number(limit));
      reply.status(200).send(users);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "An unknown error occurred." });
      }
    }
  });
}