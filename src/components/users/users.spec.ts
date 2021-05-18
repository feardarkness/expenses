import "dotenv/config";
import app from "../../../app";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import sinon from "sinon";

let connection: Connection;

describe("User routes", () => {
  before(async () => {
    connection = await createConnection();
    console.log("connection created");
  });

  describe("Create user", () => {
    it("should create a user", async () => {
      const response = await request(app).post("/users").send({
        firstName: "Jhon",
        lastName: "Snow",
        age: 30,
        email: "{{email}}",
        password: "123",
      });
      console.log("response======================");
      console.log(response.body);
      console.log("======================");
    });
  });

  after(async () => {
    if (connection) {
      await connection.query("DELETE FROM user");
      await connection.close();
    }
  });
});
