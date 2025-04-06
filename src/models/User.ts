import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database";
import { Tweet } from "./Tweet";
import { Tagging } from "./Tagging";

export class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public active!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    this.belongsToMany(Tweet, { through: Tagging, foreignKey: "userId", as: "taggedTweets" });
  }
}

// Initialize the User model
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    }
  },
  {
    sequelize,
    tableName: "Users",
    timestamps: true, // [createdAt and updatedAt]
  }
);