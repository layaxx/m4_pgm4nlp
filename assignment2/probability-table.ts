export class ProbabilityTable {
  data: Map<string, Map<string, number>> = new Map()
  ylength: number

  constructor(rangeSize: number) {
    this.ylength = rangeSize
  }

  #concatValues(values: string[]): string {
    return values.sort().join("---")
  }

  conditionalProbability(value: string, parentValues: string[]): number {
    const parents = this.data.get(this.#concatValues(parentValues))

    if (!parents) {
      // FIXME: why do we do this instead of returning #value observed / #total observations?
      return 1 / this.ylength
    }

    const numerator = parents?.get(value)

    if (!numerator) {
      return 0
    }

    return numerator / [...parents.values()].reduce((a, b) => a + b)
  }

  observe(value: string, parentValues: string[]) {
    const key = this.#concatValues(parentValues)
    const parents = this.data.get(key)

    if (!parents) {
      this.data.set(key, new Map([[value, 1]]))
      return
    }

    const count = parents.get(value)

    parents.set(value, (count ?? 0) + 1)
  }
}
