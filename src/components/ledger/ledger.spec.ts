import "dotenv/config";
import app from "../../../app";
import request from "supertest";
import { Connection, createConnection, getManager } from "typeorm";
import sinon from "sinon";
import chai from "chai";
import sinonChai from "sinon-chai";
import { User } from "../users/users.entity";
import { UserStatus } from "../../common/enums/UserStatus";
import loginService from "../auth/login.service";

import { UserType } from "../../common/enums/UserType";
import { Thing } from "../things/things.entity";
import { Ledger } from "./ledger.entity";

let expect = chai.expect;
chai.use(sinonChai);

let sinonSandbox: sinon.SinonSandbox;
let connection: Connection;

let user1: User;
const user1Email = "ledgerThing@email.com";
let user1JWT: string;

let user3JWT: string;

let thing1user1: Thing;
let thing2user2: Thing;
let thing3user3: Thing;

let ledgerEntry1user1: Ledger;
let ledgerEntry2user2: Ledger;
let ledgerEntry3user1: Ledger;
let ledgerEntry4user3: Ledger;
let ledgerEntry5user3: Ledger;

describe("Ledger routes", () => {
  before(async () => {
    connection = await createConnection();
    const repository = connection.getRepository(User);

    user1 = new User();
    user1.email = user1Email;
    user1.password = "123";
    user1.status = UserStatus.active;
    user1.type = UserType.user;
    await repository.save(user1);
    let { token } = await loginService.generateToken(user1);
    user1JWT = token;

    let user2 = new User();
    user2.email = "user2email@email.com";
    user2.password = "123";
    user2.status = UserStatus.active;
    user2.type = UserType.user;
    await repository.save(user2);

    let user3 = new User();
    user3.email = "user3email@email.com";
    user3.password = "123";
    user3.status = UserStatus.active;
    user3.type = UserType.user;
    await repository.save(user3);
    let { token: tokenUser3 } = await loginService.generateToken(user3);
    user3JWT = tokenUser3;

    const thingRepository = connection.getRepository(Thing);

    thing1user1 = new Thing();
    thing1user1.name = "A thing 1";
    thing1user1.description = "A thing description 1";
    thing1user1.user = user1;
    await thingRepository.save(thing1user1);

    thing2user2 = new Thing();
    thing2user2.name = "A thing 2";
    thing2user2.description = "A thing description 2";
    thing2user2.user = user2;
    await thingRepository.save(thing2user2);

    thing3user3 = new Thing();
    thing3user3.name = "A thing 3";
    thing3user3.description = "A thing description 3";
    thing3user3.user = user3;
    await thingRepository.save(thing3user3);

    const ledgerRepository = connection.getRepository(Ledger);

    ledgerEntry1user1 = new Ledger();
    ledgerEntry1user1.amount = 50.0;
    ledgerEntry1user1.thing = thing1user1;
    ledgerEntry1user1.user = user1;
    await ledgerRepository.save(ledgerEntry1user1);

    ledgerEntry2user2 = new Ledger();
    ledgerEntry2user2.amount = 500.0;
    ledgerEntry2user2.thing = thing2user2;
    ledgerEntry2user2.user = user2;
    await ledgerRepository.save(ledgerEntry2user2);

    ledgerEntry3user1 = new Ledger();
    ledgerEntry3user1.amount = 90.0;
    ledgerEntry3user1.thing = thing1user1;
    ledgerEntry3user1.user = user1;
    await ledgerRepository.save(ledgerEntry3user1);

    ledgerEntry4user3 = new Ledger();
    ledgerEntry4user3.amount = 90.0;
    ledgerEntry4user3.thing = thing3user3;
    ledgerEntry4user3.user = user3;
    await ledgerRepository.save(ledgerEntry4user3);

    ledgerEntry5user3 = new Ledger();
    ledgerEntry5user3.amount = 100.0;
    ledgerEntry5user3.thing = thing3user3;
    ledgerEntry5user3.user = user3;
    await ledgerRepository.save(ledgerEntry5user3);
  });

  after(async () => {
    if (connection) {
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

  describe("[GET /ledgers/:entryId]", () => {
    it("should fail without a valid JWT", async () => {
      const { body, status } = await request(app)
        .get(`/ledgers/${ledgerEntry3user1.id}`)
        .set("Authorization", `Bearer `);

      expect(status).to.equal(401);
    });

    it("should fail if the entryId belongs to another user", async () => {
      const { body, status } = await request(app)
        .get(`/ledgers/${ledgerEntry2user2.id}`)
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(404);
    });

    it("should get an ledger by id", async () => {
      const { body, status } = await request(app)
        .get(`/ledgers/${ledgerEntry3user1.id}`)
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(200);
      expect(body.amount).to.equal("90.00");
      expect(body.thingId).to.equal(thing1user1.id);
      expect(body.userId).to.equal(user1.id);
    });
  });

  describe("[PUT /ledgers/:entryId]", () => {
    it("should fail without a valid JWT", async () => {
      const { body, status } = await request(app)
        .put(`/ledgers/${ledgerEntry3user1.id}`)
        .send({
          amount: 1234.8,
          date: "2021-02-25",
        })
        .set("Authorization", `Bearer `);

      expect(status).to.equal(401);
    });

    it("should fail if the entryId belongs to another user", async () => {
      const { body, status } = await request(app)
        .put(`/ledgers/${ledgerEntry2user2.id}`)
        .send({
          amount: 1234.8,
          thingId: thing1user1.id,
          date: "2021-02-25",
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(404);

      expect(body).to.deep.equal({
        error: "Entry not found",
      });
    });

    it("should fail if the thingId belongs to another user", async () => {
      const { body, status } = await request(app)
        .put(`/ledgers/${ledgerEntry1user1.id}`)
        .send({
          amount: 1234.8,
          thingId: thing2user2.id,
          date: "2021-02-25",
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(400);
      expect(body).to.deep.equal({ error: "Thing not found or doesn't belong to the user", detail: [] });
    });

    it("should update an entry by id", async () => {
      const { body, status } = await request(app)
        .put(`/ledgers/${ledgerEntry3user1.id}`)
        .send({
          amount: 444555.8,
          thingId: thing1user1.id,
          date: "2021-02-25",
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(200);
      expect(body).to.deep.equal({
        message: "Entry updated successfully",
      });
    });
  });

  describe("[DELETE /ledgers/:entryId]", () => {
    it("should fail without a valid JWT", async () => {
      const { body, status } = await request(app)
        .delete(`/ledgers/${ledgerEntry1user1.id}`)
        .set("Authorization", `Bearer `);

      expect(status).to.equal(401);
    });

    it("should work even if the UUID is not found", async () => {
      const { body, status } = await request(app)
        .delete(`/ledgers/f0dfab29-1f91-4868-9e6f-ca50760b04fa`)
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(204);
    });

    it("should delete an entry in the ledger", async () => {
      const { body, status } = await request(app)
        .delete(`/ledgers/${ledgerEntry1user1.id}`)
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(204);

      const ledgerRepository = getManager().getRepository(Ledger);
      const result = await ledgerRepository.findOne(ledgerEntry1user1.id);

      expect(result).to.be.undefined;
    });

    it("should not delete an entry of another user", async () => {
      const { body, status } = await request(app)
        .delete(`/ledgers/${ledgerEntry2user2.id}`)
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(204);

      const ledgerRepository = getManager().getRepository(Ledger);
      const result = await ledgerRepository.findOne(ledgerEntry2user2.id);

      expect(result).to.not.be.undefined;
    });
  });

  describe("[GET /ledgers]", () => {
    it("should fail with an invalid JWT", async () => {
      const { body, status } = await request(app).get(`/ledgers`).set("Authorization", `Bearer `);

      expect(status).to.equal(401);
    });

    it("should return entries from an user [1]", async () => {
      const { body, status } = await request(app).get(`/ledgers`).set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(200);
      expect(body).to.have.property("records");
      expect(body).to.have.property("total");
      expect(body).to.have.property("limit");
      expect(body).to.have.property("offset");
    });

    it("should return entries from an user [2]", async () => {
      const { body, status } = await request(app)
        .get(`/ledgers?limit=2&offset=0`)
        .set("Authorization", `Bearer ${user3JWT}`);

      expect(status).to.equal(200);
      expect(body).to.have.property("records");
      expect(body.records).to.have.length(2);
      expect(body).to.have.property("total");
      expect(body.total).to.equal(2);
      expect(body).to.have.property("limit");
      expect(body.limit).to.equal(2);
      expect(body).to.have.property("offset");
      expect(body.offset).to.equal(0);
    });

    it("should return entries from an user with limit and offset", async () => {
      const { body, status } = await request(app)
        .get(`/ledgers?limit=2&offset=1`)
        .set("Authorization", `Bearer ${user3JWT}`);

      expect(status).to.equal(200);
      expect(body).to.have.property("records");
      expect(body.records).to.have.length(1);
      expect(body).to.have.property("total");
      expect(body.total).to.equal(2);
      expect(body).to.have.property("limit");
      expect(body.limit).to.equal(2);
      expect(body).to.have.property("offset");
      expect(body.offset).to.equal(1);
    });

    it("should return entries from an user with order ASC", async () => {
      const { body, status } = await request(app)
        .get(`/ledgers?order=createdAt`)
        .set("Authorization", `Bearer ${user3JWT}`);

      expect(status).to.equal(200);
      const [item1, item2] = body.records;

      expect(Date.parse(item1.createdAt)).to.be.lessThan(Date.parse(item2.createdAt));
    });

    it("should return entries from an user with order DESC", async () => {
      const { body, status } = await request(app)
        .get(`/ledgers?order=-createdAt`)
        .set("Authorization", `Bearer ${user3JWT}`);

      expect(status).to.equal(200);
      const [item1, item2] = body.records;

      expect(Date.parse(item1.createdAt)).to.be.greaterThan(Date.parse(item2.createdAt));
    });

    it("should return entries from an user, searching by thingId", async () => {
      const { body, status } = await request(app)
        .get(`/ledgers?thingId=${thing3user3.id}`)
        .set("Authorization", `Bearer ${user3JWT}`);

      expect(status).to.equal(200);

      expect(body.records).to.have.length(2);
    });
  });

  describe("[POST /ledgers]", () => {
    it("should fail if amount is negative", async () => {
      let amount = -90.7;
      let date = "2021-05-23";
      const { body, status } = await request(app)
        .post("/ledgers")
        .send({
          amount,
          thingId: thing1user1.id,
          date,
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(400);
    });

    it("should work if amount is 0", async () => {
      let amount = 0.0;
      let date = "2021-05-23";
      const { body, status } = await request(app)
        .post("/ledgers")
        .send({
          amount,
          thingId: thing1user1.id,
          date,
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(201);
      expect(body).to.have.all.keys(["id", "amount", "thingId", "userId", "date", "createdAt", "updatedAt"]);

      expect(body.amount).to.equal(amount);
      expect(body.thingId).to.equal(thing1user1.id);
      expect(body.userId).to.equal(user1.id);
      expect(body.date).to.equal(date);
    });

    it("should fail without a valid JTW", async () => {
      let amount = 90.7;
      const { body, status } = await request(app)
        .post("/ledgers")
        .send({
          amount,
          thingId: thing1user1.id,
        })
        .set("Authorization", `Bearer `);

      expect(status).to.equal(401);
    });

    it("should fail trying to create an entry with a thing from another user", async () => {
      let amount = 90.7;
      let date = "2021-05-23";
      const { body, status } = await request(app)
        .post("/ledgers")
        .send({
          amount,
          thingId: thing3user3.id,
          date,
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(400);
    });

    it("should create an entry", async () => {
      let amount = 90.7;
      let date = "2021-05-23";
      const { body, status } = await request(app)
        .post("/ledgers")
        .send({
          amount,
          thingId: thing1user1.id,
          date,
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(201);

      expect(body.amount).to.equal(amount);
      expect(body.thingId).to.equal(thing1user1.id);
      expect(body.userId).to.equal(user1.id);
      expect(body.date).to.equal(date);
    });
  });
});
