const DEV = import.meta.env.DEV

function serial(v: unknown): unknown {
  if (v === null || v === undefined) return String(v)
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

export function debugLog(...args: unknown[]) {
  if (DEV) {
    console.debug(...args.map(serial))
  }
}
