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
}
