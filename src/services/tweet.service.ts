import { User } from "../models/User";
import { Tagging } from "../models/Tagging";
import { Tweet } from "../models/Tweet";
import { UserService } from "./user.service";

export class TweetService {
  /**
   * Create a new tweet with tagging users (tagging is optional)
   * Tagging is not part of the tweet and has to be submitted with a seperate field
   * 
   * @param userId: number
   * @param content: string
   * @param taggedUserIds: Array<number>
   * @returns Promise<{ tweet: Tweet, validTaggedUsers: Array<number> }>
   */
  static async createTweetWithTags(userId: number, content: string, taggedUserIds: number[]): Promise<{ tweet: Tweet, validTaggedUsers: Array<string> }> {
    /*
     * Create a new tweet
     * -----------
     * Indication: 
     * -----------
     * Depending on the business logic required, transaction can be rolled back if one of the tagged user id does not exist 
     * Or can be inserted with the correct available user id(s) by skipping the wrong id(s)
     * Or if one user id is incorrect (user does not exist), omit the entire tagging operation and keep the tweet exist without tagging
     */
    const tweet = await Tweet.create({ userId, content });

    // Tag users for the current tweet
    const validTaggedUsers: string[] = [];
    for (const taggedUserId of taggedUserIds) {
      const taggedUser = await UserService.findById(taggedUserId);
      if (taggedUser) {
        await Tagging.create({ tweetId: tweet.id, userId: taggedUserId });
        validTaggedUsers.push(taggedUser.username); // Log the valid tagged user (by username)
      }
    }

    // Return the created tweet with the existing tagged user(s)
    return { tweet, validTaggedUsers };
  }

   /**
   * Create a new tweet with inline tagging users (tagging is optional)
   * Tagging is part of the tweet content, no need to be provided with a seperate field
   * 
   * @param userId: number
   * @param content: string
   * @returns Promise<{ tweet: Tweet, validTaggedUsers: Array<string> }>
   */
   static async createTweetWithInlineTags(userId: number, content: string): Promise<{ tweet: Tweet, validTaggedUsers: Array<string> }> {
    /*
     * Create a new tweet with inline tags (tags are available in the tweet content)
     * -----------
     * Indication: 
     * -----------
     * Depending on the business logic required, transaction can be rolled back if one of the tagged username does not exist 
     * Or can be inserted with the correct available user username(s) by skipping the wrong username(s)
     * Or if one username is incorrect (user does not exist), omit the entire tagging operation and keep the tweet exist without tagging
     */
    // Define Regex to find all mentioned users (usernames preceded by '@')
    const usernameRegEx = /@\w+/g;
    const taggedUsernames = content.match(usernameRegEx)?.map(username => username.slice(1)) || [];
  
    // Tagging and response
    const validUserIds: number[] = [];
    const validTaggedUsers: string[] = [];
  
    for (const username of taggedUsernames) {
      const taggedUser = await UserService.findByUserName(username);
      if (taggedUser) {
        validUserIds.push(taggedUser.id);
        validTaggedUsers.push(username); // Log the valid tagged user (by username)
      }
    }
  
    // Create the tweet
    const tweet = await Tweet.create({ userId, content });
  
    // Create the tagging user(s)
    for (const userId of validUserIds) {
      await Tagging.create({ tweetId: tweet.id, userId });
    }
  
    // Return the created tweet with the existing tagged user(s)
    return { tweet, validTaggedUsers };
  }

  /**
   * Get all tweets for all users (public) - With pagination
   * 
   * @param page: number
   * @param limit: number 
   * @returns Promise<{totalTweets: number, totalPages: number, currentPage: number, tweets: Array<Tweet>}>
   */
  static async getPaginatedTweets(page: number, limit: number): Promise<{totalTweets: number, totalPages: number, currentPage: number, tweets: Array<Tweet>}> {
    // Calculate offset based on page
    const offset = (page - 1) * limit;

    const tweets = await Tweet.findAndCountAll({
      include: [
        {
          model: User,
          as: "user", // Include the user who posted the tweet
          attributes: ["id", "username", "email"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "ASC"]], // Chronologically ordered
    });

    return {
      /**
       * totalTweets: Total number of users
       * totalPages: Total number of pages
       * currentPage: Current page number
       * tweets: Tweets for the current selecting/visiting page
       */
      totalTweets: tweets.count,
      totalPages: Math.ceil(tweets.count / limit),
      currentPage: page,
      tweets: tweets.rows,
    };
  }

  /**
   * Get all tweets for a specific user (basically for the logged in user), including tweets they were tagged in
   * 
   * @param userId: number 
   * @returns Promise <{userTweets: Array<Tweet>, taggedTweets: Array<Tweet>}>
   */
  static async getTweetsForUser(userId: number): Promise<{userTweets: Array<Tweet>, taggedTweets: Array<Tweet>}> {
    //Get Tweets created by the user
    const userTweets = await Tweet.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["createdAt", "ASC"]], // Chronologically ordered
    });

    // Tweets the user was tagged in
    const taggedTweets = await Tweet.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
        {
          model: User,
          as: "taggedUsers",
          where: { id: userId },
          attributes: ["id", "username"],
        },
      ],
      order: [["createdAt", "ASC"]], // Chronologically ordered
    });

    return { userTweets, taggedTweets };
  }
}