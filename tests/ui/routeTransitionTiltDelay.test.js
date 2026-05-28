import assert from "node:assert/strict";
import test from "node:test";

test("route transitions wait for the visible glass-ring tilt when requested", async () => {
  const { pushWithTransition } = await import("../../lib/routeTransition.js");
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const dispatchedEvents = [];
  const scheduledTimers = [];
  const routerCalls = [];

  globalThis.window = {
    sessionStorage: {
      setItem() {},
      removeItem() {}
    },
    dispatchEvent(event) {
      dispatchedEvents.push(event);
    },
    setTimeout(callback, delay) {
      scheduledTimers.push({ callback, delay });
      return scheduledTimers.length;
    },
    clearTimeout() {},
    matchMedia() {
      return { matches: false };
    },
    innerWidth: 1280
  };
  globalThis.document = {
    documentElement: {
      getAttribute() {
        return "desktop";
      }
    },
    body: {
      getAttribute() {
        return "desktop";
      }
    }
  };

  try {
    pushWithTransition(
      {
        push(href) {
          routerCalls.push(href);
        }
      },
      "/profiil",
      {
        glassRingTilt: "right",
        waitForGlassRingTilt: true,
        persistGlassRingTilt: false
      }
    );

    assert.equal(dispatchedEvents.length, 1);
    assert.equal(dispatchedEvents[0].detail.glassRingTilt, "right");
    assert.deepEqual(routerCalls, []);
    assert.equal(scheduledTimers.length, 1);
    assert.equal(scheduledTimers[0].delay, 540);

    scheduledTimers[0].callback();
    assert.deepEqual(routerCalls, ["/profiil"]);
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});

test("explicit route-transition delays continue to override the tilt wait", async () => {
  const { pushWithTransition } = await import("../../lib/routeTransition.js");
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const scheduledTimers = [];
  const routerCalls = [];

  globalThis.window = {
    sessionStorage: {
      setItem() {},
      removeItem() {}
    },
    dispatchEvent() {},
    setTimeout(callback, delay) {
      scheduledTimers.push({ callback, delay });
      return scheduledTimers.length;
    },
    clearTimeout() {},
    matchMedia() {
      return { matches: false };
    },
    innerWidth: 1280
  };
  globalThis.document = {
    documentElement: {
      getAttribute() {
        return "desktop";
      }
    },
    body: {
      getAttribute() {
        return "desktop";
      }
    }
  };

  try {
    pushWithTransition(
      {
        push(href) {
          routerCalls.push(href);
        }
      },
      "/vestlus",
      {
        delayMs: 680,
        glassRingTilt: "left",
        waitForGlassRingTilt: true,
        persistGlassRingTilt: false
      }
    );

    assert.equal(scheduledTimers.length, 1);
    assert.equal(scheduledTimers[0].delay, 680);
    scheduledTimers[0].callback();
    assert.deepEqual(routerCalls, ["/vestlus"]);
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});

test("workspace handoff delays are desktop-only", async () => {
  const { pushWithTransition } = await import("../../lib/routeTransition.js");
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const scheduledTimers = [];
  const routerCalls = [];

  globalThis.window = {
    sessionStorage: {
      setItem() {},
      removeItem() {}
    },
    dispatchEvent() {},
    setTimeout(callback, delay) {
      scheduledTimers.push({ callback, delay });
      return scheduledTimers.length;
    },
    clearTimeout() {},
    matchMedia(query) {
      return { matches: query.includes("max-width: 768px") };
    },
    innerWidth: 390
  };
  globalThis.document = {
    documentElement: {
      getAttribute() {
        return "mobile";
      }
    },
    body: {
      getAttribute() {
        return "mobile";
      }
    }
  };

  try {
    pushWithTransition(
      {
        push(href) {
          routerCalls.push(href);
        }
      },
      "/tooheaolu",
      {
        delayMs: 120,
        persistGlassRingTilt: false,
        workspacePanelMorph: "test-morph"
      }
    );

    assert.equal(scheduledTimers.length, 0);
    assert.deepEqual(routerCalls, ["/tooheaolu"]);
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});
