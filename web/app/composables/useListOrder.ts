/**
 * Per-user, client-side ordering of dashboard lists.
 *
 * Lists are shared documents, so a manual order can't live on the server
 * without leaking one user's arrangement to everyone. Instead we persist an
 * array of list IDs in localStorage, keyed by user ID so multiple accounts on
 * the same browser stay independent.
 */
export const useListOrder = () => {
  const storageKey = (userId: string) => `grocerme:list-order:${userId}`;

  /** Load the saved order for a user. Returns [] on SSR or if nothing valid is stored. */
  const loadOrder = (userId: string): string[] => {
    if (!import.meta.client || !userId) return [];
    try {
      const raw = localStorage.getItem(storageKey(userId));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === "string")
        : [];
    } catch {
      return [];
    }
  };

  /** Persist the order for a user. No-op on SSR. */
  const saveOrder = (userId: string, order: string[]): void => {
    if (!import.meta.client || !userId) return;
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(order));
    } catch {
      // Ignore quota / serialization errors — ordering is best-effort.
    }
  };

  /**
   * Apply a saved order to the current lists.
   * Lists not present in `order` (brand-new or newly-shared) float to the top
   * in their existing (server) order; known lists follow in their saved
   * sequence. Saved IDs for lists that no longer exist are ignored.
   */
  const applyOrder = <T extends { id: string }>(
    lists: T[],
    order: string[]
  ): T[] => {
    const position = new Map(order.map((id, index) => [id, index]));
    const unknown = lists.filter((list) => !position.has(list.id));
    const known = lists
      .filter((list) => position.has(list.id))
      .sort((a, b) => position.get(a.id)! - position.get(b.id)!);
    return [...unknown, ...known];
  };

  return { loadOrder, saveOrder, applyOrder };
};
