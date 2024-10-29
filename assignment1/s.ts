const cache = new Map<number, Record<number, number>>([
  [2, { 1: 1 }],
  [3, { 1: 1 }],
  [4, { 1: 1, 2: 1 }],
  [5, { 1: 1, 2: 2 }],
  [6, { 1: 1, 2: 3, 3: 1 }],
])

function update(input: Record<number, number>, out: Record<number, number>) {
  for (const keyString of Object.keys(input)) {
    const key = Number(keyString)
    out[key + 1] = (out[key + 1] ?? 0) + Number(input[keyString])
  }
}

function getSubPossibilities(num: number): Record<number, number> {
  if (num < 1) return {}

  if (!cache.has(num)) {
    const result: Record<number, number> = {}
    ;[2, 3, 4, 5, 6]
      .map((sub) => getSubPossibilities(num - sub))
      .forEach((record) => update(record, result))

    cache.set(num, result)
  }

  return cache.get(num)!
}

function getAllPossibilities(num: number): Record<number, number> {
  if (num < 1) return {}
  if (num === 1) return { 1: 1 }

  const result = {}
  const record = getSubPossibilities(num - 1)
  update(record, result)

  return result
}

export function probabilityMassOfS(s: number): number {
  return (
    Object.entries(getAllPossibilities(s))
      .map(([keyString, amount]) => amount * Math.pow(1 / 6, Number(keyString)))
      .reduce((a, b) => a + b, 0) || 0
  )
}

const LARGE_VALUE = 1500

export function expectationOfS() {
  // sum of x * p(x)

  return Array.from(
    { length: LARGE_VALUE },
    (_, i) => i * probabilityMassOfS(i)
  ).reduce((a, b) => a + b)
}

export function varianceOfS() {
  const expectation = expectationOfS()

  // i think that is infinite?
  return (
    Array.from(
      { length: LARGE_VALUE },
      (_, i) => Math.pow(i + 1 - expectation, 2) // start at 1
    ).reduce((a, b) => a + b) / LARGE_VALUE
  )
}
