import { Op } from "sequelize";
import { User } from "../models/User";
import { bcryptWrapper } from "../utils/bcryptWrapper";

export class UserService {
  /**
   * Create a new user (registration)
   * 
   * @param username: string
   * @param email: email
   * @param password: string
   * @returns Promise<User>
   */
  static async createUser(username: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcryptWrapper.hashPassword(password);
    return await User.create({ username, email, password: hashedPassword });
  }

  /**
   * Check if user is active
   * 
   * @param id: number
   * @returns Promise<boolean>
   */
  static async isActive(id: number): Promise<boolean> {
    const user = await User.findOne({
      where: { id, active: true },
      attributes: ['id'],
    });
  
    return !!user;
  }

  /**
   * Find user by email
   * 
   * @param email: string 
   * @returns Promise<User | null>
   */
  static async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email, active: true } });
  }

  /**
   * Find user by username
   * 
   * @param username: string
   * @returns Promise<User | null>
   */
  static async findByUserName(username: string): Promise<User | null> {
    return await User.findOne({ where: { username, active: true } });
  }

  /**
   * Find user by username or email
   * 
   * @param userRef: string
   * @returns Promise<User | null>
   */
  static async findByUserNameOrEmail(userRef: string): Promise<User | null> {
    return await User.findOne({
        where: {
          [Op.and]: [
            { active: true },
            {
              [Op.or]: [
                { username: userRef },
                { email: userRef },
              ],
            },
          ],
        },
      });
  }

  /**
   * Find user by id
   * 
   * @param id: number
   * @returns Promise<User | null>
   */
  static async findById(id: number): Promise<User | null> {
    return await User.findOne({
      where: {
        id,
        active: true,
      },
    });
  }

  /**
   * Search for list of usernames by username keyword (useful for front end call to find the active users for tagging)
   * 
   * @param searchKey: string
   * @param page: number
   * @param limit: number
   * @returns 
   */
  static async searchUsersByUsername(searchKey: string, page: number, limit: number): Promise<{totalUsers: number, totalPages: number, currentPage: number, users: Array<User>}> {
    const minSearchChars = process.env.DEFAULT_SEARCH_MIN_CHARACTERS || 3;
    // The 'searchKey' must have at least 3 characters
    if (searchKey.length < Number(minSearchChars)) {
      throw new Error("Search term must be at least 3 characters long.");
    }

    // Calculate the offset based on the page number
    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      where: {
        [Op.and]: [
          { active: true },
          {
            username: {
              [Op.like]: `%${searchKey}%`, // Look for partial match search
            },
          },
        ],
      },
      attributes: ["id", "username", "email"],
      limit,
      offset,
      order: [["username", "ASC"]], // Sort list by username in alphabetical order
    });

    return {
      /**
       * totalUsers: Total number of users
       * totalPages: Total number of pages
       * currentPage: Current page number
       * users: Users for the current selecting/visiting page
       */
      totalUsers: users.count,
      totalPages: Math.ceil(users.count / limit),
      currentPage: page,
      users: users.rows,
    };
  }
}
