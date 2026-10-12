export { cn } from "cn";

// ============ DEPARTEMEN HELPERS ============
export function getDepartemenName(departemen: any): string {
  if (!departemen) return "—";
  if (Array.isArray(departemen)) {
    return departemen[0]?.nama || "—";
  }
  return departemen.nama || "—";
}

export function getDepartemenId(departemen: any): string {
  if (!departemen) return "";
  if (Array.isArray(departemen)) {
    return departemen[0]?.id || "";
  }
  return departemen.id || "";
}
