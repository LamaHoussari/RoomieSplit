import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { supabase } from "../../lib/supabaseClient";
import * as choreService from "../../services/choreService";

vi.mock("../../lib/supabaseClient", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("../../lib/choreIcons", () => ({
  getChoreIcon: vi.fn(() => "default-icon"),
}));

describe("choreService", () => {
  const mockChore = {
    id: "chore-1",
    group_id: "group-1",
    name: "Clean kitchen",
    icon: "broom",
    frequency: "weekly",
    is_completed: false,
    completed_by: null,
    completed_at: null,
    archived_at: null,
    created_at: "2024-01-01",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createChore", () => {
    it("should insert chore with provided data", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: mockChore,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const newChore = {
        group_id: "group-1",
        name: "Clean kitchen",
        icon: "broom",
        frequency: "weekly",
      };

      const result = await choreService.createChore(newChore as any);

      expect(supabase.from).toHaveBeenCalledWith("chores");
      expect(mockInsert).toHaveBeenCalled();
      expect(result.data).toEqual(mockChore);
    });

    it("should use default icon if not provided", async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: mockChore,
        error: null,
      });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
      });

      const newChore = {
        group_id: "group-1",
        name: "Clean kitchen",
        frequency: "weekly",
      };

      await choreService.createChore(newChore as any);

      const callArgs = mockInsert.mock.calls[0][0];
      expect(callArgs[0].icon).toBe("default-icon");
    });
  });

  describe("getChoresByGroup", () => {
    it("should query active chores for group by default", async () => {
      const mockIs = vi.fn().mockResolvedValue({
        data: [mockChore],
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        is: mockIs,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await choreService.getChoresByGroup("group-1");

      expect(supabase.from).toHaveBeenCalledWith("chores");
      expect(mockEq).toHaveBeenCalledWith("group_id", "group-1");
      expect(mockIs).toHaveBeenCalledWith("archived_at", null);
      expect(result.data).toEqual([mockChore]);
    });

    it("should query archived chores when flag set", async () => {
      const archivedChore = { ...mockChore, archived_at: "2024-01-15" };
      const mockNot = vi.fn().mockResolvedValue({
        data: [archivedChore],
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        not: mockNot,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await choreService.getChoresByGroup("group-1", true);

      expect(mockNot).toHaveBeenCalledWith("archived_at", "is", null);
      expect(result.data).toEqual([archivedChore]);
    });
  });

  describe("getChoresByGroups", () => {
    it("should query chores across multiple groups", async () => {
      const mockIs = vi.fn().mockResolvedValue({
        data: [mockChore],
        error: null,
      });

      const mockIn = vi.fn().mockReturnValue({
        is: mockIs,
      });

      const mockSelect = vi.fn().mockReturnValue({
        in: mockIn,
      });

      (supabase.from as any).mockReturnValue({
        select: mockSelect,
      });

      const result = await choreService.getChoresByGroups(
        ["group-1", "group-2"],
        false
      );

      expect(mockIn).toHaveBeenCalledWith("group_id", ["group-1", "group-2"]);
      expect(result.data).toEqual([mockChore]);
    });
  });

  describe("updateChore", () => {
    it("should update chore fields", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: { ...mockChore, name: "Updated" },
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      const updates = { name: "Updated" };
      const result = await choreService.updateChore("chore-1", updates);

      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith("id", "chore-1");
    });

    it("should mark chore as completed with timestamp", async () => {
      const now = new Date().toISOString();
      const mockEq = vi.fn().mockResolvedValue({
        data: { ...mockChore, is_completed: true, completed_at: now },
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      const updates = { is_completed: true, completed_at: now };
      const result = await choreService.updateChore("chore-1", updates);

      expect(mockUpdate).toHaveBeenCalledWith(updates);
    });
  });

  describe("deleteChore", () => {
    it("should delete chore by ID", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      const result = await choreService.deleteChore("chore-1");

      expect(supabase.from).toHaveBeenCalledWith("chores");
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith("id", "chore-1");
      expect(result.error).toBeNull();
    });

    it("should return error on permission denied", async () => {
      const mockError = { message: "Permission denied" };
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      const mockDelete = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        delete: mockDelete,
      });

      const result = await choreService.deleteChore("chore-1");

      expect(result.error).toEqual(mockError);
    });
  });

  describe("setChoreArchivedAt", () => {
    it("should set archived_at timestamp", async () => {
      const now = new Date().toISOString();
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      const result = await choreService.setChoreArchivedAt("chore-1", now);

      expect(mockUpdate).toHaveBeenCalledWith({ archived_at: now });
      expect(mockEq).toHaveBeenCalledWith("id", "chore-1");
    });

    it("should clear archived_at with null", async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabase.from as any).mockReturnValue({
        update: mockUpdate,
      });

      const result = await choreService.setChoreArchivedAt("chore-1", null);

      expect(mockUpdate).toHaveBeenCalledWith({ archived_at: null });
    });
  });
});
