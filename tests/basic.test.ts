import { AtlasClient } from "../src/client/AtlasClient";

describe("AtlasClient", () => {
  it("should be importable", () => {
    expect(AtlasClient).toBeDefined();
    expect(typeof AtlasClient).toBe("function");
  });

  it("should create an instance with config", () => {
    const config = {
      apiUrl: "https://api.example.com",
      apiKey: "test-key",
      websiteId: "test-website-id",
    };

    const client = new AtlasClient(config);
    expect(client).toBeInstanceOf(AtlasClient);
  });
});
