import "@testing-library/jest-dom";

// Ensure Web API globals are copied to both global and window in JSDOM
const webGlobals = [
  "Request",
  "Response",
  "Headers",
  "FormData",
  "ReadableStream",
  "TransformStream",
  "WritableStream",
  "fetch",
] as const;

for (const key of webGlobals) {
  const globalVal = (globalThis as unknown as Record<string, unknown>)[key];
  if (typeof globalVal !== "undefined") {
    if (typeof (global as unknown as Record<string, unknown>)[key] === "undefined") {
      (global as unknown as Record<string, unknown>)[key] = globalVal;
    }
    if (
      typeof window !== "undefined" &&
      typeof (window as unknown as Record<string, unknown>)[key] === "undefined"
    ) {
      (window as unknown as Record<string, unknown>)[key] = globalVal;
    }
  }
}

// Mock IntersectionObserver for components that use it (e.g. ReelsContainer)
if (typeof window !== "undefined" && !window.IntersectionObserver) {
  (window as any).IntersectionObserver = class {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  };
}
