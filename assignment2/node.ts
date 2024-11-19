import { ProbabilityTable } from "./probability-table"

export class NetworkNode {
  name: string
  parents: Set<NetworkNode>
  children: Set<NetworkNode>
  range: Set<string>
  probabilityTable: ProbabilityTable

  constructor(
    newName: string,
    range: Set<string>,
    parents: Set<NetworkNode>,
    cpt: ProbabilityTable
  ) {
    this.name = newName
    this.range = range
    this.parents = parents
    this.children = new Set()
    parents.forEach((p) => p.children.add(this))
    this.probabilityTable = cpt
  }

  sample(model: Map<string, string>): string {
    const parentValues = Array.from(this.parents.values()).map(
      (parent) => model.get(parent.name)!
    )

    if (parentValues.some((v) => !v)) {
      throw new Error("Cannot sample without all parent values")
    }

    return this.probabilityTable.sample(this.range, parentValues)
  }
}
