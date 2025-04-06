import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database";
import { User } from "./User";
import { Tagging } from "./Tagging";

export class Tweet extends Model {
  public id!: number;
  public userId!: number;
  public content!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    this.belongsToMany(User, { through: Tagging, foreignKey: "tweetId", as: "taggedUsers" });
  }
}

// Initialize the Tweet model
Tweet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users", // Name of the related table
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    content: {
      type: DataTypes.STRING(280), // Limit content to 280 characters
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: "Tweets",
    timestamps: true, // [createdAt and updatedAt]
  }
);