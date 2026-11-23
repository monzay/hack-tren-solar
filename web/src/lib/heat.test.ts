import { describe, expect, it } from "vitest";
import { HEAT_RAMP } from "./heat";

describe("HEAT_RAMP", () => {
  it("tiene 10 colores hex válidos", () => {
    expect(HEAT_RAMP).toHaveLength(10);
    for (const color of HEAT_RAMP) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
