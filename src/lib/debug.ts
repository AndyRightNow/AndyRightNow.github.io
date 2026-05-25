const DEV = import.meta.env.DEV

type Lazy<T> = T | (() => T)

function resolve<T>(v: Lazy<T>): T {
  return typeof v === 'function' ? (v as () => T)() : v
}

function serial(v: unknown): unknown {
  if (v === null || v === undefined) return String(v)
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')
    return v
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

export function debugLog(...args: Lazy<unknown>[]) {
  if (!DEV) return
  console.debug(...args.map(resolve).map(serial))
}
