import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

vi.mock("../../services/choreService", () => ({
  createChore: vi.fn(),
  getChoresByGroup: vi.fn(),
  getChoresByGroups: vi.fn(),
  deleteChore: vi.fn(),
  setChoreArchivedAt: vi.fn(),
  updateChore: vi.fn(),
}));

import { useChores } from "../../hooks/useChores";
import {
  createChore,
  getChoresByGroup,
  deleteChore,
  setChoreArchivedAt,
  updateChore,
} from "../../services/choreService";
import { mockChores, TEST_GROUP_ID, TEST_USER_ID } from "../fixtures";

const mockedGetChores = vi.mocked(getChoresByGroup);
const mockedCreateChore = vi.mocked(createChore);
const mockedDeleteChore = vi.mocked(deleteChore);
const mockedArchiveChore = vi.mocked(setChoreArchivedAt);
const mockedUpdateChore = vi.mocked(updateChore);

describe("useChores", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads chores on mount", async () => {
    mockedGetChores.mockResolvedValue({ data: mockChores, error: null } as never);

    const { result } = renderHook(() => useChores(TEST_GROUP_ID));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.chores).toEqual(mockChores);
    expect(result.current.error).toBe("");
  });

  it("returns empty for null groupId", async () => {
    const { result } = renderHook(() => useChores(null));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.chores).toEqual([]);
  });

  it("sets error and clears chores on load failure", async () => {
    mockedGetChores.mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    } as never);

    const { result } = renderHook(() => useChores(TEST_GROUP_ID));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(result.current.chores).toEqual([]);
  });

  it("loading always terminates", async () => {
    mockedGetChores.mockResolvedValue({
      data: null,
      error: { message: "network error" },
    } as never);

    const { result } = renderHook(() => useChores(TEST_GROUP_ID));

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  describe("addChore", () => {
    it("creates chore and sets success message", async () => {
      mockedGetChores.mockResolvedValue({ data: [], error: null } as never);
      mockedCreateChore.mockResolvedValue({ data: null, error: null } as never);

      const { result } = renderHook(() => useChores(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.addChore({
          group_id: TEST_GROUP_ID,
          name: "Clean kitchen",
          frequency: "weekly",
          assigned_to: TEST_USER_ID,
          created_by: TEST_USER_ID,
        });
      });

      expect(success).toBe(true);
      expect(result.current.successMessage).toBeTruthy();
    });

    it("sets error on create failure", async () => {
      mockedGetChores.mockResolvedValue({ data: [], error: null } as never);
      mockedCreateChore.mockResolvedValue({
        data: null,
        error: { message: "violates row level security policy" },
      } as never);

      const { result } = renderHook(() => useChores(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.addChore({
          group_id: TEST_GROUP_ID,
          name: "X",
          frequency: "daily",
          assigned_to: null,
          created_by: TEST_USER_ID,
        });
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("removeChore", () => {
    it("deletes chore and sets success", async () => {
      mockedGetChores.mockResolvedValue({ data: mockChores, error: null } as never);
      mockedDeleteChore.mockResolvedValue({ data: null, error: null } as never);

      const { result } = renderHook(() => useChores(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.removeChore("chore-001");
      });

      expect(success).toBe(true);
      expect(result.current.successMessage).toContain("removed");
    });
  });

  describe("toggleChore", () => {
    it("toggles completion status", async () => {
      mockedGetChores.mockResolvedValue({ data: mockChores, error: null } as never);
      mockedUpdateChore.mockResolvedValue({ data: null, error: null } as never);

      const { result } = renderHook(() => useChores(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.toggleChore("chore-001", true);
      });

      expect(success).toBe(true);
      expect(mockedUpdateChore).toHaveBeenCalledWith("chore-001", { is_completed: true });
    });
  });

  describe("archiveChore / unarchiveChore", () => {
    it("archives chore", async () => {
      mockedGetChores.mockResolvedValue({ data: mockChores, error: null } as never);
      mockedArchiveChore.mockResolvedValue({ data: null, error: null } as never);

      const { result } = renderHook(() => useChores(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.archiveChore("chore-001");
      });

      expect(success).toBe(true);
      expect(result.current.successMessage).toContain("archived");
    });

    it("unarchives chore", async () => {
      mockedGetChores.mockResolvedValue({ data: mockChores, error: null } as never);
      mockedArchiveChore.mockResolvedValue({ data: null, error: null } as never);

      const { result } = renderHook(() => useChores(TEST_GROUP_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.unarchiveChore("chore-001");
      });

      expect(success).toBe(true);
      expect(result.current.successMessage).toContain("restored");
    });
  });
});
