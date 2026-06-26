/** Nối class names, bỏ falsy values. */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Tạo range số nguyên [start, end). */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => start + i);
}

/** Debounce một hàm. */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let id: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  }) as T;
}
