type ClassValue =
  | string
  | number
  | null
  | undefined
  | boolean
  | Record<string, boolean>
  | ClassValue[]

function toClassString(input: ClassValue): string {
  if (!input) return ""
  if (typeof input === "string" || typeof input === "number") return String(input)
  if (Array.isArray(input)) return input.map(toClassString).filter(Boolean).join(" ")
  if (typeof input === "object") {
    return Object.entries(input)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key)
      .join(" ")
  }
  return ""
}

// Kept for backward compatibility; no Tailwind merge required.
export function cn(...inputs: ClassValue[]) {
  return inputs.map(toClassString).filter(Boolean).join(" ")
}
