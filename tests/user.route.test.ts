import { expect } from "chai";
import Fastify from "fastify";
import sinon from "sinon";
import fastifyFormbody from "@fastify/formbody";
import { UserService } from "../src/services/user.service";
import userRoutes from "../src/routes/user.route";

describe("User routes Tests Integration", () => {
  let fastify: any;

  before(async () => {
    fastify = Fastify();
    fastify.register(fastifyFormbody);

    // Register hooks before calling ready()
    fastify.addHook("preHandler", async (request: any) => {
        // Attach services to the request
        request.services = {
        comparePassword: sinon.stub().resolves(true),
        generateToken: sinon.stub().returns("jwToken"),
        };
    });

    await fastify.register(userRoutes, { prefix: "/api" });

    // Ensure all plugins and routes are loaded
    await fastify.ready();
  });

  after(async () => {
    await fastify.close();
  });

  // Test case for the registration route
  it("should register a user successfully", async () => {
    // Generate random values for unique username and email
    const random = `${Math.floor(Math.random() * 1000)}_${Date.now()}`;
    const requestBody = { 
        username: `tcuser_${random}`, 
        email: `tcemail_${random}@domain.ext`, 
        password: `tC1one#_${random}` 
    };
  
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/register',
      payload: requestBody,
      headers: { 'Content-Type': 'application/json' }
    });
  
    expect(response.statusCode).to.equal(201);

    // Parse the response JSON
    const responseData = response.json();

    // Validate the relevant parts of the response
    expect(responseData.email).to.equal(`tcemail_${random}@domain.ext`);
    expect(responseData).to.have.property("id").that.is.a("number");
  });

  // Test case the login route (success case)
  it("should log in a user successfully", async () => {
    const fakeUser = { id: 15, email: "twitterclone@domain.ext", password: "P@ssw0rd!" };

    const findByUserNameOrEmailStub = sinon.stub(UserService, "findByUserNameOrEmail").resolves(fakeUser as any);

    const requestBody = { userRef: "twitterclone@domain.ext", password: "P@ssw0rd!" };

    const response = await fastify.inject({
      method: "POST",
      url: "/api/login",
      payload: requestBody,
      headers: { "Content-Type": "application/json" },
    });

    expect(response.statusCode).to.equal(200);
    expect(response.json()).to.deep.equal({
      message: "Successfully logged in.",
      token: "jwToken",
    });

    // Assert the stub calls
    expect(findByUserNameOrEmailStub.calledOnceWithExactly("twitterclone@domain.ext")).to.be.true;

    // Restore stubs
    findByUserNameOrEmailStub.restore();
  });

  // Test case the login route (failure case with code 400)
  it("should return 400 for missing required fields", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/api/login",
      payload: { userRef: "twitterclone@domain.ext" }, // Missing password field
      headers: { "Content-Type": "application/json" },
    });

    expect(response.statusCode).to.equal(400);
    expect(response.json()).to.have.property("error", "Bad Request");
    expect(response.json()).to.have.property("message");
  });

  // Test case the login route (failure case with code 401)
  it("should return 401 for invalid credentials", async () => {
    const findByUserNameOrEmailStub = sinon.stub(UserService, "findByUserNameOrEmail").resolves(null);

    const requestBody = { userRef: "twitterclone@domain.ext", password: "Invalid!" };

    const response = await fastify.inject({
      method: "POST",
      url: "/api/login",
      payload: requestBody,
      headers: { "Content-Type": "application/json" },
    });

    expect(response.statusCode).to.equal(401);
    expect(response.json()).to.have.property("error", "Invalid credentials or user is not active!");

    // Restore stubs
    findByUserNameOrEmailStub.restore();
  });
});