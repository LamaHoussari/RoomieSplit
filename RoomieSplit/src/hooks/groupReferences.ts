export type GroupReference = string | { id: string };

export function normalizeGroupIds(groups?: GroupReference[]) {
  return (groups ?? [])
    .map((group) => (typeof group === "string" ? group : group.id))
    .filter(Boolean);
}
