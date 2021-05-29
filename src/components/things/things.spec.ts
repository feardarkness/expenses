import "dotenv/config";
import app from "../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import sinon from "sinon";
import chai from "chai";
import sinonChai from "sinon-chai";
import { User } from "../users/users.entity";
import { UserStatus } from "../../common/enums/UserStatus";
import loginService from "../auth/login.service";

import { UserType } from "../../common/enums/UserType";
import thingService from "./things.service";
import { Thing } from "./things.entity";

let expect = chai.expect;
chai.use(sinonChai);

let sinonSandbox: sinon.SinonSandbox;
let connection: Connection;

let activeUser: User;
const activeUserEmail = "duplicated@email.com";
let newUserActiveJWT: string;

let thingToDelete: Thing;
let thingToUpdate: Thing;

describe("Thing routes", () => {
  before(async () => {
    connection = await createConnection();
    const repository = connection.getRepository(User);

    activeUser = new User();
    activeUser.email = activeUserEmail;
    activeUser.password = "123";
    activeUser.status = UserStatus.active;
    activeUser.type = UserType.user;
    await repository.save(activeUser);
    let { token } = await loginService.generateToken(activeUser);
    newUserActiveJWT = token;

    const thingRepository = connection.getRepository(Thing);

    thingToDelete = new Thing();
    thingToDelete.name = "thing to delete name";
    thingToDelete.description = "thing to delete description";
    await thingRepository.save(thingToDelete);

    thingToUpdate = new Thing();
    thingToUpdate.name = "thing to update name";
    thingToUpdate.description = "thing to update description";
    await thingRepository.save(thingToUpdate);
  });

  after(async () => {
    if (connection) {
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

  describe("[POST /things]", () => {
    it("should fail if no token is provided", async () => {
      const { body, status } = await request(app)
        .post("/things")
        .send({
          name: "a thing",
          description: "a thing description",
        })
        .set("Authorization", `Bearer`);

      expect(status).to.equal(401);
    });

    it("should fail if no name is provided", async () => {
      const { body, status } = await request(app)
        .post("/things")
        .send({
          name: "",
          description: "a thing description",
        })
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(400);
      expect(body).to.deep.equal({
        error: "Invalid data",
        detail: ["/name should NOT have fewer than 3 characters"],
      });
    });

    it("should create a thing", async () => {
      const { body, status } = await request(app)
        .post("/things")
        .send({
          name: "a thing",
          description: "a thing description",
        })
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(201);

      expect(body).to.have.property("id");
      expect(body).to.have.property("name");
      expect(body).to.have.property("description");

      expect(body.name).to.equal("a thing");
      expect(body.description).to.equal("a thing description");

      const thing = await thingService.findById(body.id);
      expect(thing).to.not.be.undefined;
      expect(thing?.name).to.equal("a thing");
      expect(thing?.description).to.equal("a thing description");
    });
  });

  describe("[DELETE /things/:thingId]", () => {
    it("should not be able to delete a thing without a valid JWT token", async () => {
      const { body, status } = await request(app)
        .delete(`/things/${thingToDelete.id}`)
        .set("Authorization", `Bearer XXXXXXXXX`);

      expect(status).to.equal(401);
      expect(body).to.deep.equal({
        error: "Authorization token not provided or invalid",
      });
    });

    it("should delete a thing", async () => {
      const { body, status } = await request(app)
        .delete(`/things/${thingToDelete.id}`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(204);
    });
  });

  describe("[PUT /things/:thingId]", () => {
    it("should not be able to update without a valid JWT", async () => {
      const { body, status } = await request(app)
        .put(`/things/${thingToUpdate.id}`)
        .send({
          name: "updateddd",
          description: "updateddd",
        })
        .set("Authorization", `Bearer XXX`);

      expect(status).to.equal(401);
    });

    it("should not update a thing without name", async () => {
      const { body, status } = await request(app)
        .put(`/things/${thingToUpdate.id}`)
        .send({
          description: "updateddd",
        })
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(400);

      expect(body).to.deep.equal({
        error: "Invalid data",
        detail: ["should have required property 'name'"],
      });
    });

    it("should update a thing", async () => {
      const { body, status } = await request(app)
        .put(`/things/${thingToUpdate.id}`)
        .send({
          name: "updateddd",
          description: "updateddd",
        })
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(200);

      expect(body).to.deep.equal({
        message: "Thing updated successfully",
      });
    });
  });

  describe("[GET /things/:thingId]", () => {
    it("should not be able to get an id without a valid JWT token", async () => {
      const { body, status } = await request(app).get(`/things/${thingToUpdate.id}`).set("Authorization", `Bearer`);

      expect(status).to.equal(401);
    });

    it("should get a thing by id", async () => {
      const { body, status } = await request(app)
        .get(`/things/${thingToUpdate.id}`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(200);

      expect(body).to.have.property("id");
      expect(body).to.have.property("name");
      expect(body).to.have.property("description");

      expect(body.id).to.equal(thingToUpdate.id);
    });
  });
});
