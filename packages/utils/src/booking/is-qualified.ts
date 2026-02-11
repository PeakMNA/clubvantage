/**
 * Check if a staff member is qualified to perform a service.
 * Staff must have ALL of the service's required capabilities (AND logic).
 * Returns true if the service has no required capabilities.
 */
export function isStaffQualified(
  staffCapabilities: string[],
  requiredCapabilities: string[]
): boolean {
  if (requiredCapabilities.length === 0) return true;
  return requiredCapabilities.every((req) =>
    staffCapabilities.includes(req)
  );
}
