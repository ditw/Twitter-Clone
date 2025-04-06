import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database";

export class Tagging extends Model {
  public tweetId!: number;
  public userId!: number;
}

// Initialize the Tagging model
Tagging.init(
  {
    tweetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "Tweets",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    tableName: "Taggings",
    timestamps: true,
  }
);