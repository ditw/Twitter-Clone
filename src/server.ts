import Fastify, { FastifyRequest } from 'fastify';
import fastifyFormbody from "@fastify/formbody";
import dotenv from "dotenv";
import { comparePassword } from "../src/utils/bcrypt";
import { generateToken } from "../src/utils/jwt";
import defaultRoutes from './routes/default.route';
import userRoutes from './routes/user.route';
import tweetRoutes from './routes/tweet.route';
import { sequelize, connection } from "./database";
import { setupAssociations } from "./models/Associations";
import "./models/User";
import "./models/Tweet"; 


dotenv.config();

const fastify = Fastify({ logger: true, ignoreTrailingSlash: true });

// Register the formbody plugin (Enabling body parsing)
fastify.register(fastifyFormbody);

// Append utils services to the request via hooks 
fastify.addHook("preHandler", async (request: FastifyRequest) => {
  request.services = {
    comparePassword,
    generateToken,
  };
});

// Register routes
fastify.register(defaultRoutes, { prefix: "/api" });
fastify.register(userRoutes, { prefix: "/api" });
fastify.register(tweetRoutes, { prefix: "/api" });

// DB Connection 
(async () => {
  try {
    // Establish database connection
    await connection();
    console.log("Database connection established.");
    // Setup Associations
    setupAssociations();

  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); 
  }
})();

// Closing DB connection on server shutting down
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    console.log("Database connection closed!");
    process.exit(0);
  } catch (error) {
    console.error("Error closing the database connection:", error);
    process.exit(1);
  }
});

// Start the server
const start = async () => {
  try {
    const port = parseInt(process.env.APP_PORT || '3000');
    await fastify.listen({ port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();