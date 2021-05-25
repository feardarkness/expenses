import "dotenv/config";
import app from "../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import sinon from "sinon";
import Mail from "../../common/mail";
import chai from "chai";
import sinonChai from "sinon-chai";
import { User } from "./users.entity";
import { UserStatus } from "../../common/enums/UserStatus";
import loginService from "../auth/login.service";
import usersService from "./users.service";
import { UserType } from "../../common/enums/UserType";

let expect = chai.expect;
chai.use(sinonChai);

let sinonSandbox: sinon.SinonSandbox;
let connection: Connection;

let activeUser: User;
const activeUserEmail = "duplicated@email.com";

let newUser: User;
const newUserEmail = "new@email.com";
let newUserActiveJWT: string;

let userToDelete: User;
let userToDeleteJWT: string;

describe("User routes", () => {
  before(async () => {
    connection = await createConnection();
    const repository = connection.getRepository(User);

    activeUser = new User();
    activeUser.email = activeUserEmail;
    activeUser.password = "123";
    activeUser.status = UserStatus.active;
    activeUser.type = UserType.user;
    await repository.save(activeUser);
    newUserActiveJWT = await loginService.generateToken(activeUser);

    newUser = new User();
    newUser.email = newUserEmail;
    newUser.password = "123";
    newUser.type = UserType.user;
    await repository.save(newUser);

    userToDelete = new User();
    userToDelete.email = "todelete@email.com";
    userToDelete.password = "123";
    userToDelete.status = UserStatus.active;
    userToDelete.type = UserType.user;
    await repository.save(userToDelete);
    userToDeleteJWT = await loginService.generateToken(userToDelete);
  });

  after(async () => {
    if (connection) {
      await connection.query("DELETE FROM public.user");
      await connection.close();
    }
  });

  beforeEach(() => {
    sinonSandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sinonSandbox.restore();
  });

  describe("[DELETE /users/:userId]", () => {
    it("should not delete a user without a token", async () => {
      const { body, status } = await request(app).delete(`/users/${userToDelete.id}`).set("Authorization", `Bearer `);

      expect(status).to.equal(401);
      expect(body).to.deep.equal({
        error: "Authorization token not provided or invalid",
      });
    });

    it("should not delete a user with a different id on the token", async () => {
      const { body, status } = await request(app)
        .delete(`/users/${userToDelete.id}`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(403);
      expect(body).to.deep.equal({
        error: "Forbidden",
      });
    });

    it("should delete a user", async () => {
      const { body, status } = await request(app)
        .delete(`/users/${userToDelete.id}`)
        .set("Authorization", `Bearer ${userToDeleteJWT}`);

      expect(status).to.equal(204);
      expect(body).to.deep.equal({});
    });
  });

  describe("[GET /users/:userId]", () => {
    it("should fail without a valid token", async () => {
      const { body, status } = await request(app).get(`/users/${activeUser.id}`);

      expect(status).to.equal(401, "Status 401 should be returned when token is not provided");
      expect(body).to.deep.equal({
        error: "Authorization token not provided or invalid",
      });
    });

    it("should fail with an invalid UUID as user id", async () => {
      const { body, status } = await request(app)
        .get(`/users/not-valid-uuid`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(400, "Status 400 should be returned if something is wrong");
      expect(body).to.deep.equal({
        error: "The user identifier should be an UUID",
        detail: [],
      });
    });

    it("should find the user by id", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(200);

      expect(body).to.have.property("id");
      expect(body).to.have.property("email");
      expect(body.email).to.equal(activeUserEmail);
    });

    it("should fail if the user id is not found", async () => {
      const { body, status } = await request(app)
        .get(`/users/90fb3a7e-27f1-4f3e-a8e9-c6dfc4f042af`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(403);

      expect(body).to.deep.equal({
        error: "Forbidden",
      });
    });

    it("should fail if the user id is not the same as the token (trying to get another user's information)", async () => {
      const { body, status } = await request(app)
        .get(`/users/${newUser.id}`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(403);

      expect(body).to.deep.equal({
        error: "Forbidden",
      });
    });
  });

  describe("[PUT /users/:userId] Create user", () => {
    it("should not be allowed to consume the route without a valid jwt", async () => {
      const createUserEmail = "tryingtoupdate@email.com";
      const { body, status } = await request(app).put(`/users/${activeUser.id}`).set("Authorization", `Bearer `).send({
        firstName: "John",
        lastName: "Snow",
        age: 30,
        email: createUserEmail,
        password: "somePassword",
      });

      expect(status).to.equal(401);
      expect(body).to.deep.equal({
        error: "Authorization token not provided or invalid",
      });
    });

    it("should not be allowed to modify email", async () => {
      const createUserEmail = "tryingtoupdate@email.com";
      const { body, status } = await request(app)
        .put(`/users/${activeUser.id}`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`)
        .send({
          firstName: "John",
          lastName: "Snow",
          age: 30,
          email: createUserEmail,
          password: "somePassword",
        });

      expect(status).to.equal(400);
      expect(body).to.deep.equal({
        error: "Invalid data",
        detail: ["should NOT have additional properties [email]"],
      });
    });

    it("should modify the information of the user", async () => {
      const { body, status } = await request(app)
        .put(`/users/${activeUser.id}`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`)
        .send({
          firstName: "Updated",
          lastName: "Updated",
          age: 30,
        });

      expect(status).to.equal(200);

      expect(body).to.deep.equal({
        message: "User updated successfully",
      });

      const updatedUser = await usersService.findById(activeUser.id);

      expect(updatedUser).to.not.be.undefined;
      expect(updatedUser?.firstName).to.equal("Updated");
      expect(updatedUser?.lastName).to.equal("Updated");
      expect(updatedUser?.age).to.equal(30);
    });
  });

  describe("[POST /users] Create user", () => {
    it("should create a user and send an activation email", async () => {
      sinonSandbox.stub(Mail, "sendEmailWithTextBody").resolves();

      const createUserEmail = "someEmail@email.com";
      const { body, status } = await request(app).post("/users").send({
        firstName: "John",
        lastName: "Snow",
        age: 30,
        email: createUserEmail,
        password: "somePassword",
      });

      expect(Mail.sendEmailWithTextBody).to.be.calledOnce;

      const firstCall = (Mail.sendEmailWithTextBody as sinon.SinonStub).getCall(0);
      const firstCallArg1 = firstCall.args[0];
      const firstCallArg2 = firstCall.args[1];

      expect(firstCallArg1.to).to.equal(createUserEmail);
      expect(firstCallArg2).to.equal("sampleKey");

      expect(status).to.equal(201, "Status 201 should be returned for created users");
      expect(body).to.deep.equal({
        message: "An email was sent with a link to activate your user. The link is valid for six hours",
      });
    });

    it("should create a user sending only email and password", async () => {
      sinonSandbox.stub(Mail, "sendEmailWithTextBody").resolves();

      const { body, status } = await request(app).post("/users").send({
        email: "anotherEmail@email.com",
        password: "somePassword",
      });

      expect(Mail.sendEmailWithTextBody).to.be.calledOnce;

      expect(status).to.equal(201, "Status 201 should be returned for created users");
      expect(body).to.deep.equal({
        message: "An email was sent with a link to activate your user. The link is valid for six hours",
      });
    });

    it("should fail trying to register a user with a duplicated email", async () => {
      sinonSandbox.stub(Mail, "sendEmailWithTextBody").resolves();

      const email = "duplicated@email.com";

      const { body, status } = await request(app).post("/users").send({
        firstName: "John",
        lastName: "Snow",
        age: 30,
        email,
        password: "somePassword",
      });

      expect(Mail.sendEmailWithTextBody).to.not.been.called;
      expect(status).to.equal(400, "Status 400 should be returned for validation errors");

      expect(body).to.have.property("error");
      expect(body.error).to.equal(`User with email ${email} already registered`);
    });

    it("should fail trying to register a user without email", async () => {
      sinonSandbox.stub(Mail, "sendEmailWithTextBody").resolves();

      const { body, status } = await request(app).post("/users").send({
        firstName: "John",
        lastName: "Snow",
        password: "asdasdsa",
      });

      expect(Mail.sendEmailWithTextBody).to.not.been.called;
      expect(status).to.equal(400, "Status 400 should be returned for validation errors");

      expect(body).to.deep.equal({
        error: "Invalid data",
        detail: ["should have required property 'email'"],
      });
    });

    it("should fail trying to register a user without password", async () => {
      sinonSandbox.stub(Mail, "sendEmailWithTextBody").resolves();

      const email = "duplicated@email.com";

      const { body, status } = await request(app).post("/users").send({
        firstName: "John",
        lastName: "Snow",
        age: 30,
        email,
      });

      expect(Mail.sendEmailWithTextBody).to.not.been.called;
      expect(status).to.equal(400, "Status 400 should be returned for validation errors");

      expect(body).to.deep.equal({
        error: "Invalid data",
        detail: ["should have required property 'password'"],
      });
    });
  });
});
