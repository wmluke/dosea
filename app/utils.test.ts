import { describe, expect, test } from "vitest";
import { isEmpty, isISODateStringLike, sanitizeConnectionUrl } from "~/utils";


describe("utils", () => {

    describe("isEmpty", () => {
        test("should return true if object, array, or string is empty", () => {
            expect(isEmpty({})).toBe(true);
            expect(isEmpty([])).toBe(true);
            expect(isEmpty("")).toBe(true);
            expect(isEmpty(undefined)).toBe(true);
            expect(isEmpty(null)).toBe(true);
        });

        test("should return false if object, array, or string has members", () => {
            expect(isEmpty({ a: 1 })).toBe(false);
            expect(isEmpty([1])).toBe(false);
            expect(isEmpty("a")).toBe(false);
            expect(isEmpty(" ")).toBe(false);
        });
    });

    describe("sanitizeConnectionUrl", () => {

        it("should remove credentials from connection string ", () => {
            expect(sanitizeConnectionUrl("postgres://bob:s/ec:r@et@foo.com:5432/db"))
                .toBe("postgres://foo.com:5432/db");
            expect(sanitizeConnectionUrl("postgres://foo.com:5432/db"))
                .toBe("postgres://foo.com:5432/db");
            expect(sanitizeConnectionUrl("/data/sample.db"))
                .toBe("/data/sample.db");
            expect(sanitizeConnectionUrl("file:///data/sample.db"))
                .toBe("file:///data/sample.db");
            expect(sanitizeConnectionUrl(undefined))
                .toBeUndefined();

        });
    });

    describe("isISODateStringLike", () => {
        it("should return true if the string starts with an ISO date format", () => {
            expect(isISODateStringLike("2023-03-27")).toBe(true);
            expect(isISODateStringLike("2023-3-7")).toBe(true);
            expect(isISODateStringLike("2023/03/27")).toBe(true);
            expect(isISODateStringLike("2023/03/27T01:10:34")).toBe(true);
        });

        it("should return false if the string does not starts with an ISO date format", () => {
            expect(isISODateStringLike(" 2023-03-27")).toBe(false);
            expect(isISODateStringLike("a 2023-3-7")).toBe(false);
            expect(isISODateStringLike(123)).toBe(false);
            expect(isISODateStringLike(new Date())).toBe(false);
        });
    });

});


