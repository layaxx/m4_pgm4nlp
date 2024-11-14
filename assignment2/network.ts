import { NetworkNode } from "./node"

export class Network {
  nodes: Map<string, NetworkNode> = new Map()

  train(observations: Array<{ [key: string]: string }>) {
    for (const observation of observations) {
      for (const [key, value] of Object.entries(observation)) {
        const node = this.nodes.get(key)

        if (!node) {
          throw new Error(`Node ${key} not found`)
        } else {
          node.probabilityTable.observe(
            value,
            [...node.parents.values()].map((parent) => observation[parent.name])
          )
        }
      }
    }
  }
}
