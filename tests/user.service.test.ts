import { expect } from "chai";
import sinon from "sinon";
import { User } from "../src/models/User";
import { UserService } from "../src/services/user.service";
import { bcryptWrapper } from "../src/utils/bcryptWrapper";

describe("UserService", () => {
  afterEach(() => {
    // Restore all stubs and mocks after each test to avoid side effects
    sinon.restore();
  });

  describe("createUser", () => {
    it("should create a new user with a hashed password", async () => {
      // Generate random values for unique username and email
      const random = `${Math.floor(Math.random() * 1000)}_${Date.now()}`;
      const username = `tcuser_${random}`;
      const email = `tcemail_${random}@domain.ext`;
      const password = `tC1one#_${random}`;
      const hashedPassword = `hashedtC1one#_${random}`;

      // Stub the hashPassword function
      const hashPasswordStub = sinon.stub(bcryptWrapper, "hashPassword").resolves(hashedPassword);

      // Stub the User.create method
      const createStub = sinon.stub(User, "create").resolves({
        username,
        email,
        password: hashedPassword,
      } as User);

      // Call the createUser method
      const user = await UserService.createUser(username, email, password);

      // Assertions for hashPassword stub
      expect(hashPasswordStub.calledOnceWith(password)).to.be.true;

      // Assertions for User.create stub
      expect(createStub.calledOnceWith({
        username,
        email,
        password: hashedPassword,
      })).to.be.true;

      // Assertion for returned user object
      expect(user).to.deep.equal({
        username,
        email,
        password: hashedPassword,
      });
    });
  });

  describe("isActive", () => {
    it("should return true if the user is active", async () => {
      const id = 1;

      // Stub the findOne method to return a user object
      const findOneStub = sinon.stub(User, "findOne").resolves({ id } as User);

      // Execute the isActive method
      const isActive = await UserService.isActive(id);

      // Assertions for findOne stub
      expect(findOneStub.calledOnceWith({
        where: { id, active: true },
        attributes: ["id"],
      })).to.be.true;

      // Assertion for returned value
      expect(isActive).to.be.true;
    });

    it("should return false if the user is not active", async () => {
      const id = 1;

      // Stub the findOne method to return null
      const findOneStub = sinon.stub(User, "findOne").resolves(null);

      // Execute the isActive method
      const isActive = await UserService.isActive(id);

      // Assertions for findOne stub
      expect(findOneStub.calledOnceWith({
        where: { id, active: true },
        attributes: ["id"],
      })).to.be.true;

      // Assertion for returned value
      expect(isActive).to.be.false;
    });
  });
});