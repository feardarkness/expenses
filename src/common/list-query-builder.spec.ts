import { expect } from "chai";
import ListQueryBuilder from "./list-query-builder";

describe("PaginationQueryBuilder", () => {
  describe("buildOffsetQuery", () => {
    it("should build the offset query with default value", () => {
      const offset = ListQueryBuilder.buildOffsetQuery(undefined);
      expect(offset).to.equal(0);
    });

    it("should build the offset query", () => {
      const offset = ListQueryBuilder.buildOffsetQuery("10");
      expect(offset).to.equal(10);
    });
  });

  describe("buildLimitQuery", () => {
    it("should build the limit query with default value", () => {
      const limit = ListQueryBuilder.buildLimitQuery(undefined);
      expect(limit).to.equal(100);
    });

    it("should build the limit query", () => {
      const limit = ListQueryBuilder.buildLimitQuery("10");
      expect(limit).to.equal(10);
    });
  });

  describe("buildWhereQuery", () => {
    it("should build the where query as empty object", () => {
      const where = ListQueryBuilder.buildWhereQuery({
        limit: "10",
      });
      expect(where).to.deep.equal({});
    });

    it("should build the where query with the values provided", () => {
      const where = ListQueryBuilder.buildWhereQuery({
        thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0",
      });
      expect(where).to.deep.equal({
        thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0",
      });
    });

    it("should build the where query with the values provided, without limit, order or offset", () => {
      const where = ListQueryBuilder.buildWhereQuery({
        thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0",
        limit: "10",
        order: "",
        offset: "100",
      });
      expect(where).to.deep.equal({
        thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0",
      });
    });
  });

  describe("buildOrderQuery", () => {
    it("should build the order query with the default value", () => {
      const order = ListQueryBuilder.buildOrderQuery(undefined, "updatedBy");
      expect(order).to.deep.equal({
        updatedBy: "DESC",
      });
    });

    it("should build the order query with one value [ASC]", () => {
      const order = ListQueryBuilder.buildOrderQuery("+updatedBy", "updatedBy");
      expect(order).to.deep.equal({
        updatedBy: "ASC",
      });
    });

    it("should build the order query with one value [ASC] without + sign", () => {
      const order = ListQueryBuilder.buildOrderQuery("updatedBy", "updatedBy");
      expect(order).to.deep.equal({
        updatedBy: "ASC",
      });
    });

    it("should build the order query with one value [DESC]", () => {
      const order = ListQueryBuilder.buildOrderQuery("-updatedBy", "updatedBy");
      expect(order).to.deep.equal({
        updatedBy: "DESC",
      });
    });

    it("should build the order query with multiple values", () => {
      const order = ListQueryBuilder.buildOrderQuery("+updatedBy,-createdBy,userId", "updatedBy");
      expect(order).to.deep.equal({
        updatedBy: "ASC",
        createdBy: "DESC",
        userId: "ASC",
      });
    });
  });

  describe("buildQuery", () => {
    it("should create a query filter with where clauses only", () => {
      const result = ListQueryBuilder.buildQuery(
        {
          thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0",
        },
        "updatedAt"
      );

      expect(result).to.deep.equal({
        take: 100,
        skip: 0,
        order: { updatedAt: "DESC" },
        where: { thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0" },
      });
    });

    it("should create a complete query filter", () => {
      const result = ListQueryBuilder.buildQuery(
        {
          limit: "10",
          offset: "11",
          order: "-updatedAt",
          thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0",
        },
        "updatedAt"
      );

      expect(result).to.deep.equal({
        take: 10,
        skip: 11,
        order: { updatedAt: "DESC" },
        where: { thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0" },
      });
    });
  });
});
