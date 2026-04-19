import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

vi.mock("../../services/groupService", () => ({
  getGroupsByUser: vi.fn(),
  createGroup: vi.fn(),
  joinGroupByCodeWithFallback: vi.fn(),
}));

import { useGroups } from "../../hooks/useGroups";
import {
  getGroupsByUser,
  createGroup,
  joinGroupByCodeWithFallback,
} from "../../services/groupService";
import { mockGroups, TEST_USER_ID } from "../fixtures";

const mockedGetGroups = vi.mocked(getGroupsByUser);
const mockedCreateGroup = vi.mocked(createGroup);
const mockedJoinGroup = vi.mocked(joinGroupByCodeWithFallback);

describe("useGroups", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads groups on mount when userId is provided", async () => {
    mockedGetGroups.mockResolvedValue({ data: mockGroups, error: null } as never);

    const { result } = renderHook(() => useGroups(TEST_USER_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.groups).toEqual(mockGroups);
    expect(result.current.error).toBe("");
  });

  it("clears groups when userId is null", async () => {
    const { result } = renderHook(() => useGroups(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.groups).toEqual([]);
  });

  it("sets error state on load failure", async () => {
    mockedGetGroups.mockResolvedValue({
      data: null,
      error: { message: "Failed to fetch" },
    } as never);

    const { result } = renderHook(() => useGroups(TEST_USER_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.groups).toEqual([]);
  });

  it("loading always ends on error path", async () => {
    mockedGetGroups.mockResolvedValue({
      data: null,
      error: { message: "Network error" },
    } as never);

    const { result } = renderHook(() => useGroups(TEST_USER_ID));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  describe("addGroup", () => {
    it("calls createGroup and reloads", async () => {
      mockedGetGroups.mockResolvedValue({ data: mockGroups, error: null } as never);
      mockedCreateGroup.mockResolvedValue({
        data: mockGroups[0],
        error: null,
      } as never);

      const { result } = renderHook(() => useGroups(TEST_USER_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let created: unknown;
      await act(async () => {
        created = await result.current.addGroup({
          name: "New Group",
          code: "NEW123",
        });
      });

      expect(created).toBeTruthy();
      expect(result.current.successMessage).toBeTruthy();
    });

    it("sets error on createGroup failure", async () => {
      mockedGetGroups.mockResolvedValue({ data: [], error: null } as never);
      mockedCreateGroup.mockResolvedValue({
        data: null,
        error: { message: "violates unique constraint" },
      } as never);

      const { result } = renderHook(() => useGroups(TEST_USER_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        const created = await result.current.addGroup({
          name: "Dup",
          code: "APT123",
        });
        expect(created).toBeNull();
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe("joinGroup", () => {
    it("calls joinGroupByCodeWithFallback and reloads", async () => {
      mockedGetGroups.mockResolvedValue({ data: mockGroups, error: null } as never);
      mockedJoinGroup.mockResolvedValue({ data: null, error: null } as never);

      const { result } = renderHook(() => useGroups(TEST_USER_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.joinGroup("INVITE");
      });

      expect(success).toBe(true);
      expect(result.current.successMessage).toBeTruthy();
    });

    it("sets error on invalid code", async () => {
      mockedGetGroups.mockResolvedValue({ data: [], error: null } as never);
      mockedJoinGroup.mockResolvedValue({
        data: null,
        error: { message: "invalid invite code" },
      } as never);

      const { result } = renderHook(() => useGroups(TEST_USER_ID));
      await waitFor(() => expect(result.current.loading).toBe(false));

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.joinGroup("BAD_CODE");
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  it("reloads groups when userId changes", async () => {
    mockedGetGroups.mockResolvedValue({ data: mockGroups, error: null } as never);

    const { result, rerender } = renderHook(
      ({ userId }) => useGroups(userId),
      { initialProps: { userId: TEST_USER_ID as string | null } }
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockedGetGroups).toHaveBeenCalledWith(TEST_USER_ID);

    rerender({ userId: "user-999" });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockedGetGroups).toHaveBeenCalledWith("user-999");
  });
});
