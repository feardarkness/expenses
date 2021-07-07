import "dotenv/config";
import app from "../../../app";
import request from "supertest";
import { Connection, createConnection, getManager } from "typeorm";
import sinon from "sinon";
import chai from "chai";
import sinonChai from "sinon-chai";
import chaiJsonSchema from "chai-json-schema-ajv";
import { User } from "../users/users.entity";
import { UserStatus } from "../../common/enums/UserStatus";
import loginService from "../auth/login.service";
import addFormats from "ajv-formats";
import Validate from "../../common/validations/validate";

import { UserType } from "../../common/enums/UserType";
import { Thing } from "./things.entity";
import { thingBasicDataSchema } from "../../common/validations/schemas/thing";

chai.use(sinonChai);
chai.use(
  chaiJsonSchema.create({
    ajv: Validate.getValidator(),
  })
);

let expect = chai.expect;

let sinonSandbox: sinon.SinonSandbox;
let connection: Connection;

let activeUser: User;
let activeUser2: User;
let newUserActiveJWT: string;
let newUser2ActiveJWT: string;

let thingToDeleteActiveUser: Thing;
let thingToUpdateActiveUser: Thing;
let thingUser2: Thing;

describe("Thing routes", () => {
  before(async () => {
    connection = await createConnection();
    const repository = connection.getRepository(User);

    activeUser = new User();
    activeUser.email = "duplicated@email.com";
    activeUser.password = "123";
    activeUser.status = UserStatus.active;
    activeUser.type = UserType.user;
    await repository.save(activeUser);
    let { token } = await loginService.generateToken(activeUser);
    newUserActiveJWT = token;

    activeUser2 = new User();
    activeUser2.email = "another@email.com";
    activeUser2.password = "123";
    activeUser2.status = UserStatus.active;
    activeUser2.type = UserType.user;
    await repository.save(activeUser2);
    let { token: token2 } = await loginService.generateToken(activeUser2);
    newUser2ActiveJWT = token2;

    const thingRepository = connection.getRepository(Thing);

    thingToDeleteActiveUser = new Thing();
    thingToDeleteActiveUser.name = "thing to delete name";
    thingToDeleteActiveUser.description = "thing to delete description";
    thingToDeleteActiveUser.user = activeUser;
    await thingRepository.save(thingToDeleteActiveUser);

    thingToUpdateActiveUser = new Thing();
    thingToUpdateActiveUser.name = "thing to update name";
    thingToUpdateActiveUser.description = "thing to update description";
    thingToUpdateActiveUser.user = activeUser;
    await thingRepository.save(thingToUpdateActiveUser);

    thingUser2 = new Thing();
    thingUser2.name = "thing user 2";
    thingUser2.description = "thing user 2 description";
    thingUser2.user = activeUser2;
    await thingRepository.save(thingUser2);
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

      expect(body).to.be.jsonSchema(thingBasicDataSchema);

      const thingRepository = getManager().getRepository(Thing);
      const thing = await thingRepository.findOne({
        where: {
          id: body.id,
          user: activeUser,
        },
      });
      expect(thing).to.not.be.undefined;
      expect(thing?.name).to.equal("a thing");
      expect(thing?.description).to.equal("a thing description");
    });
  });

  describe("[DELETE /things/:thingId]", () => {
    it("should not be able to delete a thing without a valid JWT token", async () => {
      const { body, status } = await request(app)
        .delete(`/things/${thingToDeleteActiveUser.id}`)
        .set("Authorization", `Bearer XXXXXXXXX`);

      expect(status).to.equal(401);
      expect(body).to.deep.equal({
        error: "Authorization token not provided or invalid",
      });
    });

    it("should not be able to delete another user's thing", async () => {
      const { body, status } = await request(app)
        .delete(`/things/${thingUser2.id}`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(204);
      const thingRepository = getManager().getRepository(Thing);
      const thing = await thingRepository.findOne(thingUser2.id);

      expect(thing).to.not.be.undefined;
    });

    it("should delete a thing", async () => {
      const { body, status } = await request(app)
        .delete(`/things/${thingToDeleteActiveUser.id}`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(204);
    });
  });

  describe("[PUT /things/:thingId]", () => {
    it("should not be able to update another user's thing", async () => {
      const { body, status } = await request(app)
        .put(`/things/${thingUser2.id}`)
        .send({
          name: "updateddd not cool",
          description: "updateddd not cool",
        })
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(200);

      const thingRepository = getManager().getRepository(Thing);
      const thing = await thingRepository.findOne({
        where: {
          id: thingUser2.id,
        },
      });

      expect(thing?.name).to.not.equal("updateddd not cool");
      expect(thing?.description).to.not.equal("updateddd not cool");
    });

    it("should not be able to update without a valid JWT", async () => {
      const { body, status } = await request(app)
        .put(`/things/${thingToUpdateActiveUser.id}`)
        .send({
          name: "updateddd",
          description: "updateddd",
        })
        .set("Authorization", `Bearer XXX`);

      expect(status).to.equal(401);
    });

    it("should not update a thing without name", async () => {
      const { body, status } = await request(app)
        .put(`/things/${thingToUpdateActiveUser.id}`)
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
        .put(`/things/${thingToUpdateActiveUser.id}`)
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
    it("should not be able to get a thing by id without a valid JWT token", async () => {
      const { body, status } = await request(app)
        .get(`/things/${thingToUpdateActiveUser.id}`)
        .set("Authorization", `Bearer`);

      expect(status).to.equal(401);
    });

    it("should not get a thing of another user", async () => {
      const { body, status } = await request(app)
        .get(`/things/${thingUser2.id}`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(404);
    });

    it("should get a thing by id", async () => {
      const { body, status } = await request(app)
        .get(`/things/${thingToUpdateActiveUser.id}`)
        .set("Authorization", `Bearer ${newUserActiveJWT}`);

      expect(status).to.equal(200);

      expect(body).to.have.property("id");
      expect(body).to.have.property("name");
      expect(body).to.have.property("description");

      expect(body.id).to.equal(thingToUpdateActiveUser.id);
    });
  });
});
