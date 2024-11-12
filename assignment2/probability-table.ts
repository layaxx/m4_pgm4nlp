export class ProbabilityTable {
  data: Map<string[], Map<string, number>> = new Map()
  ylength: number

  constructor(rangeSize: number) {
    this.ylength = rangeSize
  }

  conditionalProbability(value: string, parentValues: string[]): number {
    const parents = this.data.get(parentValues)

    if (!parents) {
      return 1 / this.ylength
    }

    const numerator = parents?.get(value)

    if (!numerator) {
      return 0
    }

    return numerator / [...parents.values()].reduce((a, b) => a + b)
  }
}
