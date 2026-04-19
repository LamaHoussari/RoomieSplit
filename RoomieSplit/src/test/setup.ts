<<<<<<< HEAD
import '@testing-library/jest-dom';
=======
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Auto-cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock import.meta.env
vi.stubGlobal("import", {
  meta: {
    env: {
      VITE_SUPABASE_URL: "https://test.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "test-anon-key",
      VITE_RESEND_API_KEY: "re_test_key",
      DEV: true,
    },
  },
});
>>>>>>> 44cfd732609e5c25fd849c369027d487a426ea32
