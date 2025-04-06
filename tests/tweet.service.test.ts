import { expect } from "chai";
import sinon from "sinon";
import { User } from "../src/models/User";
import { Tagging } from "../src/models/Tagging";
import { Tweet } from "../src/models/Tweet";
import { UserService } from "../src/services/user.service";
import { TweetService } from "../src/services/tweet.service";

describe("TweetService", () => {
  afterEach(() => {
    sinon.restore(); // Restore stubs after each test
  });

  describe("createTweetWithTags", () => {
    it("should create a tweet and tag valid users", async () => {
      const userId = 1; // Simulated user ID (must be exist)
      const content = "This is a tweet with tagged users!";
      const taggedUserIds = [2, 5]; // Simulated input for tagging (must be exist)
      const validTaggedUsers = ["alex", "sara"]; // Expected valid tagged usernames (must be exist)

      // Stub Tweet.create to simulate tweet creation
      const tweetStub = sinon.stub(Tweet, "create").resolves({
        userId,
        content,
      } as Tweet);

      // Stub findById to simulate finding valid users
      const userServiceStub = sinon.stub(UserService, "findById");
      userServiceStub.withArgs(2).resolves({ id: 2, username: "alex" } as User);
      userServiceStub.withArgs(5).resolves({ id: 5, username: "sara" }as User);
      userServiceStub.withArgs(99).resolves(null); // Simulate an invalid user ID

      // Stub create to simulate tagging users
      const taggingStub = sinon.stub(Tagging, "create").resolves();

      // Call the service method
      const result = await TweetService.createTweetWithTags(userId, content, taggedUserIds);

      // Assertions
      expect(tweetStub.calledOnceWith({ userId, content })).to.be.true; // Verify tweet creation
      expect(userServiceStub.callCount).to.equal(2); // Called for each tagged user
      expect(taggingStub.calledTwice).to.be.true; // Only called for valid users
      
      // Validate result without strict check for tweet id value 
      expect(result.tweet.userId).to.equal(userId);
      expect(result.tweet.content).to.equal(content);
      expect(result.validTaggedUsers).to.deep.equal(validTaggedUsers);
    });
  });
});