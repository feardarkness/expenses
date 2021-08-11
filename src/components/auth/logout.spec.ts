import "dotenv/config";
import app from "../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import bcrypt from "../../common/bcrypt";
import sinon from "sinon";
import chai from "chai";
import sinonChai from "sinon-chai";
import { User } from "../users/users.entity";
import { UserStatus } from "../../common/enums/UserStatus";
import { UserType } from "../../common/enums/UserType";
import configs from "../../configs";
import logoutController, { LogoutController } from "./logout.controller";
import logoutService, { LogoutService } from "./logout.service";

let expect = chai.expect;
chai.use(sinonChai);

let sinonSandbox: sinon.SinonSandbox;
let connection: Connection;

let activeUser: User;
let activeUserClearPass: string;

describe("Logout Routes", () => {
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
      expect(logoutController).to.equal(LogoutController.getInstance());
    });
    it("should create only one instance of LogoutService", () => {
      expect(logoutService).to.equal(LogoutService.getInstance());
    });
  });

  describe("[POST /logout] logout route", () => {
    it("should be able to logout with valid token", async () => {
      const { body, status } = await request(app).post(`/login`).send({
        email: activeUser.email,
        password: activeUserClearPass,
      });
      expect(status).to.equal(200);
      const { token } = body;

      const { status: requestStatus1 } = await request(app).get(`/things`).set("Authorization", `bearer ${token}`);

      expect(requestStatus1).to.equal(200);

      const { status: requestStatus2 } = await request(app).post(`/logout`).set("Authorization", `bearer ${token}`);

      expect(requestStatus2).to.equal(200);

      const { status: requestStatus3 } = await request(app).get(`/things`).set("Authorization", `bearer ${token}`);

      expect(requestStatus3).to.equal(401);
    });
  });
});
