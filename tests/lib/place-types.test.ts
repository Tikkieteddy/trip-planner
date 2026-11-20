import { describe, expect, it } from "vitest";
import { nearbyActivityTypes, tourismCategories } from "@/data/place-types";
import { placesRequestSchema } from "@/lib/schemas";

// Types Google Places (New) searchNearby rejects with "Unsupported types" (checked live 2026-11-20).
const unsupportedNearbyTypes = ["place_of_worship"];

describe("nearby place categories", () => {
  it("never sends a type Google rejects", () => {
    const allTypes = [...tourismCategories.flatMap((category) => category.includedTypes), ...nearbyActivityTypes];
    for (const type of unsupportedNearbyTypes) expect(allTypes).not.toContain(type);
  });

  it("gives every category its own set of types", () => {
    const keys = tourismCategories.map((category) => [...category.includedTypes].sort().join(","));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("keeps every category a valid nearby request", () => {
    for (const category of tourismCategories) {
      const parsed = placesRequestSchema.safeParse({
        mode: "nearby",
        center: { latitude: 14.53, longitude: 101.37 },
        radiusKm: 10,
        includedTypes: category.includedTypes,
      });
      expect(parsed.success, category.id).toBe(true);
    }
  });
});
