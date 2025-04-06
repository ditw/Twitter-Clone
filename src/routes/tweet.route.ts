import { FastifyInstance, FastifyReply, FastifyRequest  } from "fastify";
import dotenv from "dotenv";
import { TweetService } from "../services/tweet.service";
import { Validation } from "../utils/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { UserService } from "../services/user.service";
import { TokenPayload } from "../interfaces/TokenPayload.interface";

dotenv.config();

export default async function tweetRoutes(fastify: FastifyInstance) {
  /**
   * Create new Tweet route
   */
  fastify.post("/tweet", { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = (request as FastifyRequest & { user?: TokenPayload }).user?.id;
    const { content, taggedUserIds } = request.body as {
      userId: number;
      content: string;
      taggedUserIds?: number[]; // Optional field for tagged user(s)
    };

    try {
      /*
       * Validate required fields and check rules
       */
      if (userId === undefined || !Validation.isValidInput(userId, "number")) {
        return reply.status(400).send({ error: "Invalid user reference!" });
      }

      if (!Validation.isValidInput(content, "string")) {
        return reply.status(400).send({ error: "Invalid or missing content! Must be a string." });
      }

      if (!Validation.isValidTweetContent(content)) {
        return reply.status(400).send({ error: "Tweet content exceeds 280 characters!" });
      }

      let result;
      /*
       * Validate tagged user Ids if provided in the request
       */
      if (taggedUserIds) {
        if (!Validation.isArrayInput(taggedUserIds)) {
          return reply.status(400).send({ error: "Invalid taggedUserIds format! Must be an array." });
        }

        if (!Validation.isValidArrayInputType(taggedUserIds, "number")) {
          return reply.status(400).send({
            error: "Invalid taggedUserIds value! Must contain only integers.",
          });
        }

        // Create the tweet with tags provided in the request in sperate field
        result = await TweetService.createTweetWithTags(userId, content, taggedUserIds);

      } else {
        // Create the tweet with tags provided inline in the content
        result = await TweetService.createTweetWithInlineTags(userId, content);
      }

      // Returns the created tweet and tagged users 
      reply.status(201).send(result);
    } catch (error) {
      reply.status(400).send({ error: (error as Error).message });
    }
  });

  /**
   * Get all tweets for all users (public feed)
   */
  fastify.get("/tweets", { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Page as a default value of 1
    const { page = 1 } = request.query as { page: number };
    const limit = process.env.PAGINATION_LIMIT || 20;

    try {
      // Fetch paginated tweets from the service
      const paginatedTweets = await TweetService.getPaginatedTweets(Number(page), Number(limit));
      reply.status(200).send(paginatedTweets);
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "An unknown error occurred!" });
      }
    }
  });

  /*
   * Get all tweets for a specific user (logged-in user), including tagged tweets
   * Can be defined in different way like /user/tweets since the tweets to be retrieve belongs to the logged-in user
   * But in case of an administration view and management, Admin can see tweets for other users (optional)
   */
  fastify.get("/users/:id/tweets", { preHandler: authenticate }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: number };

    try {
      const loggedInUserId = (request as FastifyRequest & { user?: TokenPayload }).user?.id; 
      const userIsActive = await UserService.isActive(Number(loggedInUserId));
      /**
       * User must be active in this scenario to retrieve the tweets  
       * Logged in user must be same as the requested user (in this case)
       */ 
      if(!userIsActive || loggedInUserId !== Number(id)) { 
        reply.status(403).send({ error: "Forbidden!" });
      } else {
        const tweets = await TweetService.getTweetsForUser(id);
        reply.status(200).send(tweets);
      }
    } catch (error) {
      if (error instanceof Error) {
        reply.status(500).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "An unknown error occurred!" });
      }
    }
  });
}