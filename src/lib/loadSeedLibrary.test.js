import { loadSeedLibrary } from "./loadSeedLibrary.js";

describe("loadSeedLibrary", () => {
  beforeEach(() => {
    Object.defineProperty(global, "fetch", {
      configurable: true,
      writable: true,
      value: jest.fn()
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads the seed index and fetches each listed seed file", async () => {
    global.fetch.mockImplementation((url) => {
      if (url === "/seeds/index.json") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ seedFiles: ["alpha.json", "beta.json"] })
        });
      }

      if (url === "/seeds/alpha.json") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "alpha", title: "Alpha" })
        });
      }

      if (url === "/seeds/beta.json") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(null)
        });
      }

      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({})
      });
    });

    await expect(loadSeedLibrary()).resolves.toEqual([{ id: "alpha", title: "Alpha" }]);

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(global.fetch).toHaveBeenNthCalledWith(1, "/seeds/index.json", { cache: "no-store" });
    expect(global.fetch).toHaveBeenNthCalledWith(2, "/seeds/alpha.json", { cache: "no-store" });
    expect(global.fetch).toHaveBeenNthCalledWith(3, "/seeds/beta.json", { cache: "no-store" });
  });

  it("throws when the index request fails", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({})
    });

    await expect(loadSeedLibrary()).rejects.toThrow("Unable to load seed index: 500");
  });
});
