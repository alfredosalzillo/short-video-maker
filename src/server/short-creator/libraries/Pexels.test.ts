process.env.LOG_LEVEL = "debug";

import fs from "fs-extra";
import nock from "nock";
import {
  afterAll,
  afterEach,
  assert,
  beforeEach,
  expect,
  test,
  vi,
} from "vitest";

beforeEach(() => {
  nock.cleanAll();
  vi.restoreAllMocks();
});

afterEach(() => {
  nock.abortPendingRequests();
});

afterAll(() => {
  nock.restore();
});

import { OrientationEnum } from "../../../types/shorts";
import { PexelsAPI } from "./Pexels";
import path from "node:path";

test("test pexels", async () => {
  const mockResponse = fs.readFileSync(
    path.resolve("__mocks__/pexels-response.json"),
    "utf-8",
  );
  nock("https://api.pexels.com")
    .get(/videos\/search/)
    .reply(200, mockResponse);
  const pexels = new PexelsAPI("asdf");
  const video = await pexels.findVideo(["dog"], 2.4, []);
  console.log(video);
  assert.isObject(video, "Video should be an object");
});

test("should time out", async () => {
  nock("https://api.pexels.com")
    .get(/videos\/search/)
    .delay(1000)
    .times(30)
    .reply(200, {});
  await expect(async () => {
    const pexels = new PexelsAPI("asdf");
    await pexels.findVideo(["dog"], 2.4, [], OrientationEnum.portrait, 100);
  }).rejects.toThrow(
    expect.objectContaining({
      name: "TimeoutError",
    }),
  );
});

test("should retry 3 times", async () => {
  const pexels = new PexelsAPI("asdf");
  let callCount = 0;
  // biome-ignore lint/suspicious/noExplicitAny: mocking internal method
  const originalFindVideo = (pexels as any)._findVideo.bind(pexels);

  // biome-ignore lint/suspicious/noExplicitAny: mocking internal method
  vi.spyOn(pexels as any, "_findVideo").mockImplementation(async (...args) => {
    callCount++;
    if (callCount <= 2) {
      // biome-ignore lint/suspicious/noExplicitAny: mocking error
      const error = new Error("aborted") as any;
      error.name = "TimeoutError";
      throw error;
    }
    return originalFindVideo(...args);
  });

  const mockResponse = fs.readFileSync(
    path.resolve("__mocks__/pexels-response.json"),
    "utf-8",
  );
  nock("https://api.pexels.com")
    .get(/videos\/search/)
    .query(true)
    .reply(200, mockResponse);

  const video = await pexels.findVideo(
    ["dog"],
    2.4,
    [],
    OrientationEnum.portrait,
    5000,
  );
  console.log(video);
  assert.isObject(video, "Video should be an object");
  expect(callCount).toBe(3);
});
