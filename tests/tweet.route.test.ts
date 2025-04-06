import { expect } from "chai";
import Fastify from "fastify";
import sinon from "sinon";
import fastifyFormbody from "@fastify/formbody";
import { TweetService } from "../src/services/tweet.service";
import { UserService } from "../src/services/user.service";
import TweetRoute from "../src/routes/tweet.route";
import * as JwtUtil from "../src/utils/jwt";
import dotenv from "dotenv";

dotenv.config();

describe("Tweet Routes Tests Integration", () => {
  let fastify: any;
  let validToken: string;
  const mockJwtUtil = {
    ...JwtUtil, // Copy all original functionality
    verifyToken: sinon.fake.returns({ id: 1 }), // Override verifyToken
  };

  before(async () => {
    fastify = Fastify();
    fastify.register(fastifyFormbody);

    // Generate valid token for user id 1 (must be exist)
    validToken = mockJwtUtil.generateToken(1);

    // Register hooks before calling ready()
    fastify.addHook("preHandler", async (request: any) => {
        const token = request.headers.authorization?.split(" ")[1];
        const decoded = mockJwtUtil.verifyToken(token);
        request.user = decoded; // Mock authenticated user

        // Attach services to the request
        request.services = {
            comparePassword: sinon.stub().resolves(true),
            generateToken: sinon.stub().returns("jwToken"),
        };
    });

    await fastify.register(TweetRoute, { prefix: "/api" });

    // Ensure all plugins and routes are loaded
    await fastify.ready();
  });

  after(async () => {
    await fastify.close();
    sinon.restore(); // Restore all stubs
  });

  // Test case for create tweet (case of success with code 201)
  describe("POST /tweet", () => {
    it("should create a new tweet", async () => {
      const mockTweet = { 
            tweet: {
                userId: 1, 
                content: "Hey @alex, Tweet content length should not exceed 280 characters!"
            },
            "validTaggedUsers": ["alex"]
        };

      // Stub createTweetWithTags
      const createTweetStub = sinon.stub(TweetService, "createTweetWithTags").resolves(mockTweet as any);

      const response = await fastify.inject({
        method: "POST",
        url: "/api/tweet",
        headers: { Authorization: `Bearer ${validToken}` },
        payload: { content: "Hey @alex, Tweet content length should not exceed 280 characters!" },
      });

      expect(response.statusCode).to.equal(201);
      
      // Parse the response JSON
      const responseData = response.json();

      // Validate response object parameters
      expect(responseData.tweet.content).to.equal(mockTweet.tweet.content);
      expect(responseData.tweet.userId).to.equal(mockTweet.tweet.userId);
      expect(responseData.validTaggedUsers).to.deep.equal(mockTweet.validTaggedUsers);

      createTweetStub.restore();
    });
  });

  // Test case for getting tweets by user id
  describe("GET /users/:id/tweets", () => {
    // Test case for getting tweets by user id (case of success)
    it("should get tweets for a specific user", async () => {
      const mockTweets = [
        { 
            tweet: {
                userId: 1, 
                content: "First Tweet content characters!"
            },
            taggedUserIds: ["alex"] 
        },
        { 
            tweet: {
                userId: 1, 
                content: "Second Tweet content characters!"
            },
            taggedUserIds: [] 
        }
      ];  

      // Stub isActive and getTweetsForUser
      const isActiveStub = sinon.stub(UserService, "isActive").resolves(true);
      const getTweetsStub = sinon.stub(TweetService, "getTweetsForUser").resolves(mockTweets as any);

      const response = await fastify.inject({
        method: "GET",
        url: "/api/users/1/tweets",
        headers: { Authorization: `Bearer ${validToken}` },
      });

      // Parse the response JSON
      const responseData = response.json();

      // Validate the array length matches
      expect(responseData.length).to.equal(mockTweets.length);

      // Validate properties of each tweet
      responseData.forEach((tweetResponse: { tweet: { userId: any; content: any; }; taggedUserIds: any; }, index: number) => {
        const expectedTweet = mockTweets[index];
        expect(tweetResponse.tweet.userId).to.equal(expectedTweet.tweet.userId);
        expect(tweetResponse.tweet.content).to.equal(expectedTweet.tweet.content);
        expect(tweetResponse.taggedUserIds).to.deep.equal(expectedTweet.taggedUserIds);
      });

      isActiveStub.restore();
      getTweetsStub.restore();
    });

    // Test case for getting tweets by user id (case of failure with code 403)
    it("should return 403 if user is inactive or unauthorized", async () => {
      const isActiveStub = sinon.stub(UserService, "isActive").resolves(false);

      const response = await fastify.inject({
        method: "GET",
        url: "/api/users/1/tweets",
        headers: { Authorization: `Bearer ${validToken}` },
      });

      expect(response.statusCode).to.equal(403);
      // Validate the response object
      expect(response.json()).to.deep.equal({ error: "Forbidden!" });

      isActiveStub.restore();
    });
  });
});