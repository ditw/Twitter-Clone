import { User } from "./User";
import { Tweet } from "./Tweet";
import { Tagging } from "./Tagging";

/*
 * Define relationships for mapped tables
 */
export function setupAssociations() {
  User.hasMany(Tweet, { foreignKey: "userId", as: "tweets" });
  Tweet.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.belongsToMany(Tweet, { through: Tagging, foreignKey: "userId", as: "taggedTweets" });
  Tweet.belongsToMany(User, { through: Tagging, foreignKey: "tweetId", as: "taggedUsers" });
  console.log("Associations have been successfully set up.");
}