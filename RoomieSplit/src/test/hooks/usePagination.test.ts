import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "../../hooks/usePagination";

describe("usePagination", () => {
  const items = Array.from({ length: 25 }, (_, i) => `item-${i}`);

  it("returns first page of items with correct page size", () => {
    const { result } = renderHook(() => usePagination(items, 8));
    expect(result.current.pageItems).toHaveLength(8);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(4); // ceil(25/8)
    expect(result.current.totalItems).toBe(25);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it("navigates to next page", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.nextPage());
    expect(result.current.currentPage).toBe(2);
    expect(result.current.pageItems).toHaveLength(10);
    expect(result.current.hasPrevPage).toBe(true);
  });

  it("navigates to previous page", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.goToPage(3));
    act(() => result.current.prevPage());
    expect(result.current.currentPage).toBe(2);
  });

  it("clamps page number to valid range", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.goToPage(100));
    expect(result.current.currentPage).toBe(3); // totalPages = ceil(25/10) = 3
    act(() => result.current.goToPage(0));
    expect(result.current.currentPage).toBe(1);
    act(() => result.current.goToPage(-5));
    expect(result.current.currentPage).toBe(1);
  });

  it("last page has remaining items", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.goToPage(3));
    expect(result.current.pageItems).toHaveLength(5); // 25 - 20
    expect(result.current.hasNextPage).toBe(false);
  });

  it("resets to page 1 when items change", () => {
    const { result, rerender } = renderHook(
      ({ items: i }) => usePagination(i, 10),
      { initialProps: { items } }
    );
    act(() => result.current.goToPage(3));
    expect(result.current.currentPage).toBe(3);

    // Simulate items change (new length triggers reset)
    const newItems = Array.from({ length: 5 }, (_, i) => `new-${i}`);
    rerender({ items: newItems });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageItems).toHaveLength(5);
  });

  it("handles empty items array", () => {
    const { result } = renderHook(() => usePagination([], 10));
    expect(result.current.pageItems).toEqual([]);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(1);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it("allows changing page size and resets to page 1", () => {
    const { result } = renderHook(() => usePagination(items, 10));
    act(() => result.current.goToPage(2));
    act(() => result.current.setPageSize(5));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(5);
    expect(result.current.totalPages).toBe(5); // ceil(25/5)
    expect(result.current.pageItems).toHaveLength(5);
  });

  it("clamps currentPage when totalPages shrinks below it", () => {
    const { result, rerender } = renderHook(
      ({ items: i }) => usePagination(i, 10),
      { initialProps: { items } }
    );
    act(() => result.current.goToPage(3));

    // Shrink items so totalPages < currentPage
    const fewItems = Array.from({ length: 3 }, (_, i) => `few-${i}`);
    rerender({ items: fewItems });
    expect(result.current.currentPage).toBeLessThanOrEqual(result.current.totalPages);
  });
});
