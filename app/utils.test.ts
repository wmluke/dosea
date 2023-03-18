import { describe, expect, test } from "vitest";
import { isEmpty } from "~/utils";


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


