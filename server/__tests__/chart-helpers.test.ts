import { computeStageCounts, computeCompanyCounts } from "@shared/chart-helpers";
import { STATUSES } from "@shared/schema";

describe("computeStageCounts (bar chart data)", () => {
  test("returns all stages with zero counts for empty input", () => {
    const result = computeStageCounts([]);
    expect(result).toHaveLength(STATUSES.length);
    for (const entry of result) {
      expect(entry.count).toBe(0);
    }
    expect(result.map((r) => r.stage)).toEqual([...STATUSES]);
  });

  test("counts prospects correctly across stages", () => {
    const prospects = [
      { status: "Bookmarked" },
      { status: "Bookmarked" },
      { status: "Applied" },
      { status: "Interviewing" },
      { status: "Offer" },
      { status: "Offer" },
      { status: "Offer" },
    ];
    const result = computeStageCounts(prospects);
    const lookup = Object.fromEntries(result.map((r) => [r.stage, r.count]));

    expect(lookup["Bookmarked"]).toBe(2);
    expect(lookup["Applied"]).toBe(1);
    expect(lookup["Phone Screen"]).toBe(0);
    expect(lookup["Interviewing"]).toBe(1);
    expect(lookup["Offer"]).toBe(3);
    expect(lookup["Rejected"]).toBe(0);
    expect(lookup["Withdrawn"]).toBe(0);
  });

  test("preserves the canonical stage order", () => {
    const prospects = [
      { status: "Withdrawn" },
      { status: "Applied" },
      { status: "Bookmarked" },
    ];
    const result = computeStageCounts(prospects);
    const stages = result.map((r) => r.stage);

    expect(stages).toEqual([...STATUSES]);
  });

  test("ignores prospects with unknown statuses", () => {
    const prospects = [
      { status: "Applied" },
      { status: "SomethingInvalid" },
      { status: "Applied" },
    ];
    const result = computeStageCounts(prospects);
    const lookup = Object.fromEntries(result.map((r) => [r.stage, r.count]));

    expect(lookup["Applied"]).toBe(2);
    const total = result.reduce((sum, r) => sum + r.count, 0);
    expect(total).toBe(2);
  });

  test("handles a single prospect", () => {
    const result = computeStageCounts([{ status: "Rejected" }]);
    const lookup = Object.fromEntries(result.map((r) => [r.stage, r.count]));

    expect(lookup["Rejected"]).toBe(1);
    const total = result.reduce((sum, r) => sum + r.count, 0);
    expect(total).toBe(1);
  });

  test("handles all prospects in one stage", () => {
    const prospects = Array.from({ length: 10 }, () => ({ status: "Interviewing" }));
    const result = computeStageCounts(prospects);
    const lookup = Object.fromEntries(result.map((r) => [r.stage, r.count]));

    expect(lookup["Interviewing"]).toBe(10);
    for (const s of STATUSES) {
      if (s !== "Interviewing") expect(lookup[s]).toBe(0);
    }
  });
});

describe("computeCompanyCounts (pie chart data)", () => {
  test("returns empty array for empty input", () => {
    const result = computeCompanyCounts([]);
    expect(result).toEqual([]);
  });

  test("counts and groups by company name", () => {
    const prospects = [
      { companyName: "Google" },
      { companyName: "Stripe" },
      { companyName: "Google" },
      { companyName: "Google" },
      { companyName: "Stripe" },
    ];
    const result = computeCompanyCounts(prospects);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: "Google", value: 3 });
    expect(result[1]).toEqual({ name: "Stripe", value: 2 });
  });

  test("sorts companies by count descending", () => {
    const prospects = [
      { companyName: "Alpha" },
      { companyName: "Beta" },
      { companyName: "Beta" },
      { companyName: "Beta" },
      { companyName: "Gamma" },
      { companyName: "Gamma" },
    ];
    const result = computeCompanyCounts(prospects);

    expect(result[0].name).toBe("Beta");
    expect(result[0].value).toBe(3);
    expect(result[1].name).toBe("Gamma");
    expect(result[1].value).toBe(2);
    expect(result[2].name).toBe("Alpha");
    expect(result[2].value).toBe(1);
  });

  test("handles a single prospect", () => {
    const result = computeCompanyCounts([{ companyName: "Airbnb" }]);
    expect(result).toEqual([{ name: "Airbnb", value: 1 }]);
  });

  test("handles many unique companies", () => {
    const companies = Array.from({ length: 15 }, (_, i) => ({
      companyName: `Company${i}`,
    }));
    const result = computeCompanyCounts(companies);

    expect(result).toHaveLength(15);
    for (const entry of result) {
      expect(entry.value).toBe(1);
    }
  });

  test("handles companies with same count preserving entry order", () => {
    const prospects = [
      { companyName: "X" },
      { companyName: "Y" },
      { companyName: "Z" },
    ];
    const result = computeCompanyCounts(prospects);

    expect(result).toHaveLength(3);
    for (const entry of result) {
      expect(entry.value).toBe(1);
    }
  });

  test("handles duplicate company names with different casing as separate entries", () => {
    const prospects = [
      { companyName: "Google" },
      { companyName: "google" },
    ];
    const result = computeCompanyCounts(prospects);

    expect(result).toHaveLength(2);
    expect(result.find((r) => r.name === "Google")?.value).toBe(1);
    expect(result.find((r) => r.name === "google")?.value).toBe(1);
  });
});
