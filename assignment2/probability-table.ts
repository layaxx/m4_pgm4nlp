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
      console.log("fallback value")

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

  sample(range: Set<string>, parentValues: string[]): string {
    console.log("sampling, given", this.#concatValues(parentValues))

    const relevantData = this.data.get(this.#concatValues(parentValues))

    if (!relevantData) {
      // return random value from range (uniform distribution)
      return Array.from(range)[Math.floor(Math.random() * range.size)]
    }

    const relevantEntries = Array.from(relevantData.entries())

    const total = relevantEntries.reduce((sum, [_key, value]) => sum + value, 0)

    const random = Math.random() * total
    return relevantEntries.reduce(
      ([acc, sum], [value, count]) => {
        if (sum < random) {
          return [value, sum + count]
        }
        return [acc, sum]
      },
      ["", 0]
    )[0]
  }
}
