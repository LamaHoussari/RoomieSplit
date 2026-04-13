import { describe, it, expect } from "vitest";
import { getChoreIcon } from "../../lib/choreIcons";

describe("getChoreIcon", () => {
  it("returns trash icon for trash-related chores", () => {
    expect(["🗑️", "♻️"]).toContain(getChoreIcon("Take out trash"));
    expect(["🗑️", "♻️"]).toContain(getChoreIcon("recycling"));
  });

  it("returns dish icon for dish-related chores", () => {
    expect(["🍽️", "🫧"]).toContain(getChoreIcon("Wash dishes"));
    expect(["🍽️", "🫧"]).toContain(getChoreIcon("Run dishwasher"));
  });

  it("returns laundry icon for laundry", () => {
    expect(["🧺", "👕"]).toContain(getChoreIcon("Do laundry"));
  });

  it("returns a default icon for unknown chores", () => {
    const icon = getChoreIcon("Something random");
    expect(["🧹", "🧽", "✨", "📋", "🏠"]).toContain(icon);
  });

  it("is deterministic for the same input", () => {
    const a = getChoreIcon("Vacuum the floor");
    const b = getChoreIcon("Vacuum the floor");
    expect(a).toBe(b);
  });

  it("handles empty string without crashing", () => {
    const icon = getChoreIcon("");
    expect(["🧹", "🧽", "✨", "📋", "🏠"]).toContain(icon);
  });
});
