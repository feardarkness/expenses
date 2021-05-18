import "dotenv/config";
import app from "../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import sinon from "sinon";
import Mail from "../../common/mail";
import chai from "chai";
import sinonChai from "sinon-chai";
import usersService from "./users.service";

let expect = chai.expect;
chai.use(sinonChai);

let sinonSandbox: sinon.SinonSandbox;

let connection: Connection;

describe("User routes", () => {
  before(async () => {
    connection = await createConnection();

    await usersService.create({
      email: "duplicated@email.com",
      password: "",
    });
    console.log("connection created");
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

  describe("[POST /users] Create user", () => {
    it("should create a user", async () => {
      sinonSandbox.stub(Mail, "sendEmailWithTextBody").resolves();

      const { body, status } = await request(app).post("/users").send({
        firstName: "John",
        lastName: "Snow",
        age: 30,
        email: "someEmail@email.com",
        password: "somePassword",
      });

      expect(status).to.equal(201, "Status 201 should be returned for created users");
      expect(body).to.deep.equal({
        message: "An email was sent with a link to activate your user. The link is valid for six hours.",
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

      expect(status).to.equal(400, "Status 400 should be returned for validation errors");

      expect(body).to.have.property("error");
      expect(body.error).to.equal(`User with email ${email} already registered`);
    });
  });
});
