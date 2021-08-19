import "dotenv/config";
import app from "../../../app";
import request from "supertest";
import { Connection, createConnection, getManager } from "typeorm";
import sinon from "sinon";
import chai from "chai";
import sinonChai from "sinon-chai";
import { User } from "./users.entity";
import { UserStatus } from "../../common/enums/UserStatus";
import loginService from "../auth/login.service";
import { UserType } from "../../common/enums/UserType";
import { Thing } from "../things/things.entity";
import { Ledger } from "../ledger/ledger.entity";
import { LedgerEntryType } from "../../common/enums/LedgerEntryType";
import DateCommon from "../../common/date-common";

let expect = chai.expect;
chai.use(sinonChai);

let sinonSandbox: sinon.SinonSandbox;
let connection: Connection;

let activeUser: User;
let activeUserJwt: string;
let anotherUserJwt: string;
let thing1: Thing;
let thing2: Thing;
let thing3: Thing;

describe("User reports", () => {
  before(async () => {
    connection = await createConnection();
    const userRepository = connection.getRepository(User);
    const thingRepository = connection.getRepository(Thing);
    const ledgerRepository = connection.getRepository(Ledger);

    activeUser = new User();
    activeUser.email = "activeUserEmail@email.com";
    activeUser.password = "123";
    activeUser.status = UserStatus.active;
    activeUser.type = UserType.user;
    await userRepository.save(activeUser);
    let { token } = await loginService.generateToken(activeUser);
    activeUserJwt = token;

    const otherUser = new User();
    otherUser.email = "other@email.com";
    otherUser.password = "123";
    otherUser.status = UserStatus.active;
    otherUser.type = UserType.user;
    await userRepository.save(otherUser);
    let { token: token2 } = await loginService.generateToken(otherUser);
    anotherUserJwt = token2;

    thing1 = new Thing();
    thing1.name = "Food";
    thing1.description = "All about food";
    thing1.user = activeUser;
    await thingRepository.save(thing1);

    thing2 = new Thing();
    thing2.name = "Games";
    thing2.description = "All about Games";
    thing2.user = activeUser;
    await thingRepository.save(thing2);

    thing3 = new Thing();
    thing3.name = "Books";
    thing3.description = "All about Books";
    thing3.user = activeUser;
    await thingRepository.save(thing3);

    const entry1AnotherUser = new Ledger();
    entry1AnotherUser.amount = -450;
    entry1AnotherUser.thing = thing1;
    entry1AnotherUser.type = LedgerEntryType.expense;
    entry1AnotherUser.date = "2021-05-31";
    entry1AnotherUser.user = otherUser;
    await ledgerRepository.save(entry1AnotherUser);

    const entry2AnotherUser = new Ledger();
    entry2AnotherUser.amount = -450;
    entry2AnotherUser.thing = thing1;
    entry2AnotherUser.type = LedgerEntryType.expense;
    entry2AnotherUser.date = "2021-06-30";
    entry2AnotherUser.user = otherUser;
    await ledgerRepository.save(entry2AnotherUser);

    const entry1 = new Ledger();
    entry1.amount = -400.25;
    entry1.thing = thing2;
    entry1.type = LedgerEntryType.expense;
    entry1.date = "2021-06-30";
    entry1.user = activeUser;
    await ledgerRepository.save(entry1);

    const entry2 = new Ledger();
    entry2.amount = 500;
    entry2.thing = thing1;
    entry2.type = LedgerEntryType.income;
    entry2.date = "2021-06-01";
    entry2.user = activeUser;
    await ledgerRepository.save(entry2);

    const entry3 = new Ledger();
    entry3.amount = -450;
    entry3.thing = thing1;
    entry3.type = LedgerEntryType.expense;
    entry3.date = "2021-05-31";
    entry3.user = activeUser;
    await ledgerRepository.save(entry3);

    const entry4 = new Ledger();
    entry4.amount = 500.25;
    entry4.thing = thing2;
    entry4.type = LedgerEntryType.income;
    entry4.date = "2021-05-01";
    entry4.user = activeUser;
    await ledgerRepository.save(entry4);

    const entry5 = new Ledger();
    entry5.amount = 100.25;
    entry5.thing = thing1;
    entry5.type = LedgerEntryType.income;
    entry5.date = "2021-05-01";
    entry5.user = activeUser;
    await ledgerRepository.save(entry5);

    const entry6 = new Ledger();
    entry6.amount = -150.25;
    entry6.thing = thing1;
    entry6.type = LedgerEntryType.expense;
    entry6.date = "2021-06-30";
    entry6.user = activeUser;
    await ledgerRepository.save(entry6);

    const entry7 = new Ledger();
    entry7.amount = -150.25;
    entry7.thing = thing3;
    entry7.type = LedgerEntryType.expense;
    entry7.date = "2021-06-13";
    entry7.user = activeUser;
    await ledgerRepository.save(entry7);

    const entry8 = new Ledger();
    entry8.amount = -150.25;
    entry8.thing = thing3;
    entry8.type = LedgerEntryType.expense;
    entry8.date = "2019-06-13";
    entry8.user = activeUser;
    await ledgerRepository.save(entry8);
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

  describe("[GET /users/:userId/reports]", () => {
    it("should not be able to get reports from another user", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}/reports`)
        .set("Authorization", `Bearer ${anotherUserJwt}`);

      expect(status).to.equal(403);
      expect(body).to.deep.equal({
        error: "Forbidden",
      });
    });

    it("should not be able to get reports without a JWT", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}/reports`)
        .set("Authorization", `Bearer `);

      expect(status).to.equal(401);
      expect(body).to.deep.equal({
        error: "Authorization token not provided or invalid",
      });
    });

    it("should not be able to get reports without a valid uuid in the url", async () => {
      const { body, status } = await request(app)
        .get(`/users/nothing/reports`)
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(404);
      expect(body).to.deep.equal({
        error: "User not found. The identifier should be an UUID",
      });
    });

    it("should not be able to get reports without 'interval', 'minDate' and 'maxDate' query params", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}/reports?`)
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(400);
      expect(body).to.deep.equal({
        error: "Invalid data",
        detail: ["must have required property 'interval'"],
      });
    });

    it("should not be able to get reports without 'minDate' query param", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}/reports?interval=Monthly&maxDate=2021-06-30`)
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(400);
      expect(body).to.deep.equal({
        error: "Invalid data",
        detail: ["must have required property 'minDate'"],
      });
    });

    it("should not be able to get reports without 'maxDate' query param", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}/reports?interval=Monthly&minDate=2021-06-01`)
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(400);
      expect(body).to.deep.equal({
        error: "Invalid data",
        detail: ["must have required property 'maxDate'"],
      });
    });

    it("should not be able to get daily reports for more than 94 days", async () => {
      const minDate = "2021-01-01";
      const maxDate = DateCommon.addTime(new Date(minDate), { days: 96 });
      const { body, status } = await request(app)
        .get(
          `/users/${
            activeUser.id
          }/reports?interval=Daily&minDate=${minDate}&&maxDate=${DateCommon.formatDateWithoutTime(maxDate)}`
        )
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(400);
      expect(body).to.deep.equal({
        error: "Expected range of days is 94 with a Daily interval",
        detail: [],
      });
    });

    it("should not be able to get weekly reports for more than 27 weeks", async () => {
      const minDate = "2021-01-01";
      const maxDate = DateCommon.addTime(new Date(minDate), { weeks: 28 });
      const { body, status } = await request(app)
        .get(
          `/users/${
            activeUser.id
          }/reports?interval=Weekly&minDate=${minDate}&&maxDate=${DateCommon.formatDateWithoutTime(maxDate)}`
        )
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(400);
      expect(body).to.deep.equal({
        error: "Expected range of months is six with a Weekly interval",
        detail: [],
      });
    });

    it("should not be able to get monthly reports for more than 12 months", async () => {
      const minDate = "2021-01-01";
      const maxDate = DateCommon.addTime(new Date(minDate), { months: 13 });
      const { body, status } = await request(app)
        .get(
          `/users/${
            activeUser.id
          }/reports?interval=Monthly&minDate=${minDate}&&maxDate=${DateCommon.formatDateWithoutTime(maxDate)}`
        )
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(400);
      expect(body).to.deep.equal({
        error: "Expected range of months is twelve with a Monthly interval",
        detail: [],
      });
    });

    it("should not be able to get yearly reports for more than 10 years", async () => {
      const minDate = "2021-01-01";
      const maxDate = DateCommon.addTime(new Date(minDate), { years: 11 });
      const { body, status } = await request(app)
        .get(
          `/users/${
            activeUser.id
          }/reports?interval=Yearly&minDate=${minDate}&&maxDate=${DateCommon.formatDateWithoutTime(maxDate)}`
        )
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(400);
      expect(body).to.deep.equal({
        error: "Expected range of years is ten with a Yearly interval",
        detail: [],
      });
    });

    it("should get reports for every year (group by expenseType and interval=year)", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}/reports?interval=Yearly&minDate=2021-01-01&&maxDate=2021-12-31`)
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(200);
      expect(body).to.have.all.keys(["data"]);

      body.data.forEach((data) => {
        expect(data).to.have.all.keys(["groupedDate", "total", "type"]);
        expect(data.groupedDate).to.satisfy((str) => str.startsWith("2021-01-01"));
      });

      const income = body.data.find((d) => d.type === LedgerEntryType.income);
      const expense = body.data.find((d) => d.type === LedgerEntryType.expense);

      expect(expense.total).to.equal("-1150.75");
      expect(income.total).to.equal("1100.50");
    });

    it("should get reports for every month (group by expenseType and interval=month)", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}/reports?interval=Monthly&minDate=2021-05-01&&maxDate=2021-06-30`)
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(200);
      expect(body).to.have.all.keys(["data"]);

      body.data.forEach((data) => expect(data).to.have.all.keys(["groupedDate", "total", "type"]));

      const [juneIncome, mayIncome] = body.data.filter((d) => d.type === LedgerEntryType.income);
      const [juneExpense, mayExpense] = body.data.filter((d) => d.type === LedgerEntryType.expense);

      expect(juneExpense.total).to.equal("-700.75");
      expect(juneIncome.total).to.equal("500.00");
      expect(juneExpense.groupedDate).to.satisfy((str) => str.startsWith("2021-06-01"));
      expect(juneIncome.groupedDate).to.satisfy((str) => str.startsWith("2021-06-01"));

      expect(mayExpense.total).to.equal("-450.00");
      expect(mayIncome.total).to.equal("600.50");
      expect(mayExpense.groupedDate).to.satisfy((str) => str.startsWith("2021-05-01"));
      expect(mayIncome.groupedDate).to.satisfy((str) => str.startsWith("2021-05-01"));
    });

    it("should get reports for every day (group by entryType (default) and interval=daily)", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}/reports?interval=Daily&minDate=2021-06-01&&maxDate=2021-06-30`)
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(200);
      expect(body).to.have.all.keys(["data"]);

      expect(body.data).to.have.length(60); // 30 days * 2 ledger types (income, expense)

      body.data.forEach((data) => expect(data).to.have.all.keys(["groupedDate", "total", "type"]));

      const incomes = body.data.filter((d) => d.type === LedgerEntryType.income);
      const expenses = body.data.filter((d) => d.type === LedgerEntryType.expense);

      expect(incomes).to.have.length(30);
      expect(expenses).to.have.length(30);

      const [income1, income2] = incomes.filter((i) => i.total !== "0");
      const [expense1, expense2, expense3] = expenses.filter((i) => i.total !== "0");

      expect(income2).to.be.undefined; // only one income with total !== 0
      expect(expense3).to.be.undefined; // only two expenses with total !== 0

      expect(expense1.groupedDate).to.satisfy((d) => d.startsWith("2021-06-30"));
      expect(expense1.total).to.equal("-550.50");

      expect(expense2.groupedDate).to.satisfy((d) => d.startsWith("2021-06-13"));
      expect(expense2.total).to.equal("-150.25");

      expect(income1.groupedDate).to.satisfy((d) => d.startsWith("2021-06-01"));
      expect(income1.total).to.equal("500.00");
    });

    it("should get reports for every day (group by entryType and interval=daily)", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}/reports?interval=Daily&minDate=2021-06-01&maxDate=2021-06-30&groupBy[]=EntryType`)
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(200);
      expect(body).to.have.all.keys(["data"]);

      expect(body.data).to.have.length(60); // 30 days * 2 ledger types (income, expense)

      body.data.forEach((data) => expect(data).to.have.all.keys(["groupedDate", "total", "type"]));

      const incomes = body.data.filter((d) => d.type === LedgerEntryType.income);
      const expenses = body.data.filter((d) => d.type === LedgerEntryType.expense);

      expect(incomes).to.have.length(30);
      expect(expenses).to.have.length(30);

      const [income1, income2] = incomes.filter((i) => i.total !== "0");
      const [expense1, expense2, expense3] = expenses.filter((i) => i.total !== "0");

      expect(income2).to.be.undefined; // only one income with total !== 0
      expect(expense3).to.be.undefined; // only two expenses with total !== 0

      expect(expense1.groupedDate).to.satisfy((d) => d.startsWith("2021-06-30"));
      expect(expense1.total).to.equal("-550.50");

      expect(expense2.groupedDate).to.satisfy((d) => d.startsWith("2021-06-13"));
      expect(expense2.total).to.equal("-150.25");

      expect(income1.groupedDate).to.satisfy((d) => d.startsWith("2021-06-01"));
      expect(income1.total).to.equal("500.00");
    });

    it("should get reports for every day (group by thing and interval=monthly)", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}/reports?interval=Monthly&minDate=2021-06-01&maxDate=2021-07-30&groupBy[]=Thing`)
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(200);
      expect(body).to.have.all.keys(["data"]);

      expect(body.data).to.have.length(6);
      body.data.forEach((item) => {
        expect(item).to.satisfy(
          (d) => d?.groupedDate?.startsWith("2021-06-01") || d?.groupedDate?.startsWith("2021-07-01")
        );
      });

      const thing1Results = body.data.filter((d) => d.thingId === thing1.id);
      const thing2Results = body.data.filter((d) => d.thingId === thing2.id);
      const thing3Results = body.data.filter((d) => d.thingId === thing3.id);

      expect(thing1Results).to.deep.equal([
        {
          groupedDate: "2021-07-01T04:00:00.000Z",
          total: "0",
          thingId: thing1.id,
        },
        {
          groupedDate: "2021-06-01T04:00:00.000Z",
          total: "349.75",
          thingId: thing1.id,
        },
      ]);
      expect(thing2Results).to.deep.equal([
        {
          groupedDate: "2021-07-01T04:00:00.000Z",
          total: "0",
          thingId: thing2.id,
        },
        {
          groupedDate: "2021-06-01T04:00:00.000Z",
          total: "-400.25",
          thingId: thing2.id,
        },
      ]);
      expect(thing3Results).to.deep.equal([
        {
          groupedDate: "2021-07-01T04:00:00.000Z",
          total: "0",
          thingId: thing3.id,
        },
        {
          groupedDate: "2021-06-01T04:00:00.000Z",
          total: "-150.25",
          thingId: thing3.id,
        },
      ]);
    });

    it("should get reports for incorrect interval", async () => {
      const { body, status } = await request(app)
        .get(`/users/${activeUser.id}/reports?interval=asdsadsa&minDate=2020-05-26&maxDate=2020-05-29`)
        .set("Authorization", `Bearer ${activeUserJwt}`);

      expect(status).to.equal(400);
      expect(body).to.deep.equal({
        error: "Invalid data",
        detail: ["interval must be equal to one of the allowed values [Monthly,Yearly,Weekly,Daily]."],
      });
    });
  });
});
