import { describe, expect, it } from "vitest";
import { formatBrazilPhone } from "./phone-mask";

describe("formatBrazilPhone", () => {
  it("formats progressively as digits are typed", () => {
    expect(formatBrazilPhone("")).toBe("");
    expect(formatBrazilPhone("1")).toBe("(1");
    expect(formatBrazilPhone("11")).toBe("(11");
    expect(formatBrazilPhone("119")).toBe("(11) 9");
    expect(formatBrazilPhone("119876")).toBe("(11) 9876");
    expect(formatBrazilPhone("1198765432")).toBe("(11) 9876-5432");
    expect(formatBrazilPhone("11987654321")).toBe("(11) 98765-4321");
  });

  it("strips non-digit characters before formatting", () => {
    expect(formatBrazilPhone("(11) 98765-4321")).toBe("(11) 98765-4321");
    expect(formatBrazilPhone("11 9 8765 4321")).toBe("(11) 98765-4321");
  });

  it("caps at 11 digits, ignoring anything typed beyond that", () => {
    expect(formatBrazilPhone("119876543219999")).toBe("(11) 98765-4321");
  });
});
