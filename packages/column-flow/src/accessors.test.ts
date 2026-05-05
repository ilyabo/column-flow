import {describe, expect, it} from "vitest";
import {getAccessorValue, getRequiredAccessorValue} from "./accessors";

describe("accessors", () => {
  it("reads values from property keys", () => {
    expect(getAccessorValue({id: "mining"}, "id", "")).toBe("mining");
  });

  it("reads values from functions", () => {
    expect(getAccessorValue({id: "mining"}, (item) => item.id.toUpperCase(), "")).toBe(
      "MINING"
    );
  });

  it("throws for required empty values", () => {
    expect(() => getRequiredAccessorValue({id: ""}, "id", "node id")).toThrow(
      "node id"
    );
  });
});
