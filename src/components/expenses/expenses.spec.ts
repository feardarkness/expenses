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
import { Expense } from "./expenses.entity";

let expect = chai.expect;
chai.use(sinonChai);

let sinonSandbox: sinon.SinonSandbox;
let connection: Connection;

let user1: User;
const user1Email = "expenseThing@email.com";
let user1JWT: string;

let thing1: Thing;

let expense1user1: Expense;
let expense2user2: Expense;
let expense3user1: Expense;

describe("Expense routes", () => {
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

    const thingRepository = connection.getRepository(Thing);

    thing1 = new Thing();
    thing1.name = "A thing";
    thing1.description = "A thing description";
    await thingRepository.save(thing1);

    let thing2 = new Thing();
    thing2.name = "A thing 2";
    thing2.description = "A thing description 2";
    await thingRepository.save(thing2);

    const expenseRepository = connection.getRepository(Expense);

    expense1user1 = new Expense();
    expense1user1.amount = 50;
    expense1user1.thing = thing1;
    expense1user1.user = user1;
    await expenseRepository.save(expense1user1);

    expense2user2 = new Expense();
    expense2user2.amount = 500;
    expense2user2.thing = thing2;
    expense2user2.user = user2;
    await expenseRepository.save(expense2user2);

    expense3user1 = new Expense();
    expense3user1.amount = 90;
    expense3user1.thing = thing1;
    expense3user1.user = user1;
    await expenseRepository.save(expense3user1);
  });

  after(async () => {
    if (connection) {
      await connection.query("DELETE FROM public.expense");
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

  describe("[GET /expenses/:expenseId]", () => {
    it("should fail without a valid JWT", async () => {
      const { body, status } = await request(app).get(`/expenses/${expense3user1.id}`).set("Authorization", `Bearer `);

      expect(status).to.equal(401);
    });

    it("should fail if the expenseId belongs to another user", async () => {
      const { body, status } = await request(app)
        .get(`/expenses/${expense2user2.id}`)
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(404);
    });

    it("should get an expense by id", async () => {
      const { body, status } = await request(app)
        .get(`/expenses/${expense3user1.id}`)
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(200);
      expect(body).to.deep.equal({
        amount: "90.00",
        thingId: thing1.id,
        userId: user1.id,
      });
    });
  });

  describe("[PUT /expenses/:expenseId]", () => {
    it("should fail without a valid JWT", async () => {
      const { body, status } = await request(app)
        .put(`/expenses/${expense3user1.id}`)
        .send({
          amount: 1234,
        })
        .set("Authorization", `Bearer `);

      expect(status).to.equal(401);
    });

    it("should fail if the expenseId belongs to another user", async () => {
      const { body, status } = await request(app)
        .put(`/expenses/${expense2user2.id}`)
        .send({
          amount: 1234,
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(404);
    });

    it("should update an expense by id", async () => {
      const { body, status } = await request(app)
        .put(`/expenses/${expense3user1.id}`)
        .send({
          amount: 1234,
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(200);
      expect(body).to.deep.equal({
        message: "Expense updated successfully",
      });
    });
  });

  describe("[DELETE /expenses/:expenseId]", () => {
    it("should fail without a valid JWT", async () => {
      const { body, status } = await request(app)
        .delete(`/expenses/${expense1user1.id}`)
        .set("Authorization", `Bearer `);

      expect(status).to.equal(401);
    });

    it("should work even if the UUID is not found", async () => {
      const { body, status } = await request(app)
        .delete(`/expenses/f0dfab29-1f91-4868-9e6f-ca50760b04fa`)
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(204);
    });

    it("should delete an expense", async () => {
      const { body, status } = await request(app)
        .delete(`/expenses/${expense1user1.id}`)
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(204);

      const expenseRepository = getManager().getRepository(Expense);
      const result = await expenseRepository.findOne(expense1user1.id);

      expect(result).to.be.undefined;
    });

    it("should not delete an expense of another user", async () => {
      const { body, status } = await request(app)
        .delete(`/expenses/${expense2user2.id}`)
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(204);

      const expenseRepository = getManager().getRepository(Expense);
      const result = await expenseRepository.findOne(expense2user2.id);

      expect(result).to.not.be.undefined;
    });
  });

  describe("[POST /expenses]", () => {
    it("should fail if amount is negative", async () => {
      let amount = -90.7;
      const { body, status } = await request(app)
        .post("/expenses")
        .send({
          amount,
          userId: user1.id,
          thingId: thing1.id,
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(400);

      expect(body).to.deep.equal({
        error: "Invalid data",
        detail: ["/amount should be >= 0"],
      });
    });

    it("should work if amount is 0", async () => {
      let amount = 0;
      const { body, status } = await request(app)
        .post("/expenses")
        .send({
          amount,
          userId: user1.id,
          thingId: thing1.id,
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(201);

      expect(body).to.deep.equal({
        amount,
        userId: user1.id,
        thingId: thing1.id,
      });
    });

    it("should fail without a valid JTW", async () => {
      let amount = 90.7;
      const { body, status } = await request(app)
        .post("/expenses")
        .send({
          amount,
          userId: user1.id,
          thingId: thing1.id,
        })
        .set("Authorization", `Bearer `);

      expect(status).to.equal(401);
    });

    it("should create an expense", async () => {
      let amount = 90.7;
      const { body, status } = await request(app)
        .post("/expenses")
        .send({
          amount,
          userId: user1.id,
          thingId: thing1.id,
        })
        .set("Authorization", `Bearer ${user1JWT}`);

      expect(status).to.equal(201);

      expect(body).to.deep.equal({
        amount,
        userId: user1.id,
        thingId: thing1.id,
      });
    });
  });
});
