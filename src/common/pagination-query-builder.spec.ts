import { expect } from "chai";
import PaginationQueryBuilder from "./pagination-query-builder";

describe("PaginationQueryBuilder", () => {
  describe("buildOffsetQuery", () => {
    it("should build the offset query with default value", () => {
      const offset = PaginationQueryBuilder.buildOffsetQuery(undefined);
      expect(offset).to.equal(0);
    });

    it("should build the offset query", () => {
      const offset = PaginationQueryBuilder.buildOffsetQuery("10");
      expect(offset).to.equal(10);
    });
  });

  describe("buildLimitQuery", () => {
    it("should build the limit query with default value", () => {
      const limit = PaginationQueryBuilder.buildLimitQuery(undefined);
      expect(limit).to.equal(100);
    });

    it("should build the limit query", () => {
      const limit = PaginationQueryBuilder.buildLimitQuery("10");
      expect(limit).to.equal(10);
    });
  });

  describe("buildWhereQuery", () => {
    it("should build the where query as empty object", () => {
      const where = PaginationQueryBuilder.buildWhereQuery({
        limit: "10",
      });
      expect(where).to.deep.equal({});
    });

    it("should build the where query with the values provided", () => {
      const where = PaginationQueryBuilder.buildWhereQuery({
        thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0",
      });
      expect(where).to.deep.equal({
        thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0",
      });
    });

    it("should build the where query with the values provided, without limit, order or offset", () => {
      const where = PaginationQueryBuilder.buildWhereQuery({
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
      const order = PaginationQueryBuilder.buildOrderQuery(undefined, "updatedBy");
      expect(order).to.deep.equal({
        updatedBy: "ASC",
      });
    });

    it("should build the order query with one value [ASC]", () => {
      const order = PaginationQueryBuilder.buildOrderQuery("+updatedBy", "updatedBy");
      expect(order).to.deep.equal({
        updatedBy: "ASC",
      });
    });

    it("should build the order query with one value [ASC] without + sign", () => {
      const order = PaginationQueryBuilder.buildOrderQuery("updatedBy", "updatedBy");
      expect(order).to.deep.equal({
        updatedBy: "ASC",
      });
    });

    it("should build the order query with one value [DESC]", () => {
      const order = PaginationQueryBuilder.buildOrderQuery("-updatedBy", "updatedBy");
      expect(order).to.deep.equal({
        updatedBy: "DESC",
      });
    });

    it("should build the order query with multiple values", () => {
      const order = PaginationQueryBuilder.buildOrderQuery("+updatedBy,-createdBy,userId", "updatedBy");
      expect(order).to.deep.equal({
        updatedBy: "ASC",
        createdBy: "DESC",
        userId: "ASC",
      });
    });
  });

  describe("buildQuery", () => {
    it("should create a query filter with where clauses only", () => {
      const result = PaginationQueryBuilder.buildQuery(
        {
          thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0",
        },
        "updatedAt"
      );

      expect(result).to.deep.equal({
        take: 100,
        skip: 0,
        order: { updatedAt: "ASC" },
        where: { thingId: "5b562b79-0d10-44af-9254-b38372d2f6b0" },
      });
    });

    it("should create a complete query filter", () => {
      const result = PaginationQueryBuilder.buildQuery(
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
