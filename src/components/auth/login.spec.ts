import "dotenv/config";
import app from "../../../app";
import request from "supertest";
import { Connection, createConnection, getManager } from "typeorm";
import bcrypt from "../../common/bcrypt";
import sinon from "sinon";
import chai from "chai";
import sinonChai from "sinon-chai";
import { User } from "../users/users.entity";
import { UserStatus } from "../../common/enums/UserStatus";
import { UserType } from "../../common/enums/UserType";
import configs from "../../configs";
import { TokenBlacklist } from "../tokens/tokens-blacklist.entity";
import DateCommon from "../../common/date-common";
import loginController, { LoginController } from "./login.controller";
import loginMiddleware, { LoginMiddleware } from "./login.middleware";
import loginService, { LoginService } from "./login.service";
import Mail from "../../common/mail";

let expect = chai.expect;
chai.use(sinonChai);

let sinonSandbox: sinon.SinonSandbox;
let connection: Connection;

let activeUser: User;
let activeUserClearPass: string;

let newUser: User;
let newUserClearPass: string;

let inactiveUser: User;
let inactiveUserClearPass: string;

describe("Login Routes", () => {
  before(async () => {
    connection = await createConnection();
    const repository = connection.getRepository(User);

    activeUserClearPass = "123";
    activeUser = new User();
    activeUser.email = "email@email.com";
    activeUser.password = await bcrypt.hash(activeUserClearPass, configs.jwt.saltRounds);
    activeUser.status = UserStatus.active;
    activeUser.type = UserType.user;
    await repository.save(activeUser);

    newUserClearPass = "1234";
    newUser = new User();
    newUser.email = "emailnewuser@email.com";
    newUser.password = await bcrypt.hash(newUserClearPass, configs.jwt.saltRounds);
    newUser.status = UserStatus.new;
    newUser.type = UserType.user;
    await repository.save(newUser);

    inactiveUserClearPass = "abcdef";
    inactiveUser = new User();
    inactiveUser.email = "emailinactiveuser@email.com";
    inactiveUser.password = await bcrypt.hash(inactiveUserClearPass, configs.jwt.saltRounds);
    inactiveUser.status = UserStatus.inactive;
    inactiveUser.type = UserType.user;
    await repository.save(inactiveUser);
  });

  after(async () => {
    if (connection) {
      await connection.query("DELETE FROM public.token_blacklist");
      await connection.query("DELETE FROM public.token_refresh");
      await connection.query("DELETE FROM public.ledger");
      await connection.query("DELETE FROM public.thing");
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

  describe("Singleton", () => {
    it("should create only one instance of LoginController", () => {
      expect(loginController).to.equal(LoginController.getInstance());
    });
    it("should create only one instance of LoginMiddleware", () => {
      expect(loginMiddleware).to.equal(LoginMiddleware.getInstance());
    });
    it("should create only one instance of LoginService", () => {
      expect(loginService).to.equal(LoginService.getInstance());
    });
  });

  describe("[POST /login] login route", () => {
    it("should send an activation email to a new User (not yet active)", async () => {
      sinonSandbox.stub(Mail, "sendEmailWithTextBody").resolves();
      const { body, status } = await request(app).post(`/login`).send({
        email: newUser.email,
        password: newUserClearPass,
      });

      expect(status).to.equal(400);

      expect(Mail.sendEmailWithTextBody).to.be.calledOnce;
      expect(body).to.deep.equal({
        error: "Looks like your account is not yet verified. Please check your email.",
        detail: [],
      });
    });

    it("should not login with an inactive user", async () => {
      const { body, status } = await request(app).post(`/login`).send({
        email: inactiveUser.email,
        password: inactiveUserClearPass,
      });

      expect(status).to.equal(401);
    });

    it("should login with an active user", async () => {
      const { body, status } = await request(app).post(`/login`).send({
        email: activeUser.email,
        password: activeUserClearPass,
      });

      expect(status).to.equal(200);
      expect(body).to.have.all.keys(["token", "refreshToken", "user"]);
      expect(body.user).to.have.all.keys(["email", "id", "fullName", "age"]);
      expect(body).to.not.have.keys(["password"]);
    });
  });

  describe("test jwt token returned by login", () => {
    it("should not be able to consume a protected route with authorization JWT instead of Bearer", async () => {
      const { body, status } = await request(app).post(`/login`).send({
        email: activeUser.email,
        password: activeUserClearPass,
      });
      expect(status).to.equal(200);
      const { token } = body;

      const { status: requestStatus } = await request(app).get(`/things`).set("Authorization", `jwt ${token}`);

      expect(requestStatus).to.equal(401);
    });

    it("should not be able to consume a protected route with a blacklisted token", async () => {
      const { body, status } = await request(app).post(`/login`).send({
        email: activeUser.email,
        password: activeUserClearPass,
      });
      expect(status).to.equal(200);
      const { token } = body;

      const tokenBlacklist = new TokenBlacklist();
      tokenBlacklist.token = token;
      tokenBlacklist.expires = DateCommon.addTime(new Date(), {
        hours: 3,
      });
      const tokenBlackListRepository = getManager().getRepository(TokenBlacklist);
      await tokenBlackListRepository.save(tokenBlacklist);

      const { status: requestStatus, body: b } = await request(app)
        .get(`/things`)
        .set("Authorization", `bearer ${token}`);

      expect(requestStatus).to.equal(401);
    });

    it("should be able to consume a protected route with a valid jwt token", async () => {
      // tests run too fast, better to wait one second to avoid setting this user's token blacklisted
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("");
        }, 1000);
      });
      const { body, status } = await request(app).post(`/login`).send({
        email: activeUser.email,
        password: activeUserClearPass,
      });
      expect(status).to.equal(200);
      const { token } = body;

      const { status: requestStatus, body: b } = await request(app)
        .get(`/things`)
        .set("Authorization", `bearer ${token}`);

      expect(requestStatus).to.equal(200);
    });
  });
});
