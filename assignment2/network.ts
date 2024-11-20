import { NetworkNode } from "./node"

export type Observation = Record<string, string>

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

  probabilityOf(obs: Observation, given: Observation): number {
    const names = Object.keys(obs)
    if (names.length > 1) {
      if (names.length === 2) {
        return (
          this.probabilityOf(
            { [names[0]]: obs[names[0]] },
            { [names[1]]: obs[names[1]], ...given }
          ) *
          this.probabilityOf(
            { [names[1]]: obs[names[1]] },
            { [names[0]]: obs[names[0]], ...given }
          )
        )
      }

      throw new Error(
        "Not yet implemented: No more than two observation at a time"
      )
    }

    const [name] = names,
      value = obs[name]

    const node = this.nodes.get(name)
    if (!node) {
      throw new Error(`Node ${name} not found`)
    }

    // if node has no parents and nothing is given
    if (node.parents.size === 0 && Object.keys(given).length === 0) {
      return node.probabilityTable.conditionalProbability(value, [])
    }

    // if node has no parents and something is given
    // TODO: WHAT TO DO HERE?

    // if node has parents and they are given and nothing else is given
    if (
      node.parents.size === Object.keys(given).length &&
      Object.keys(given).every((key) => node.parents.has(this.nodes.get(key)!))
    ) {
      return node.probabilityTable.conditionalProbability(
        value,
        [...node.parents.values()].map((parent) => given[parent.name])
      )
    }

    // if node has parents and nothing is given
    if (node.parents.size > 0 && Object.keys(given).length === 0) {
      let result = 0

      if (node.parents.size > 1) {
        throw new Error(
          "Not yet implemented: cannot have multiple parents per node"
        )
      }
      for (const parentValue of [...node.parents.values()]
        .at(0)!
        .range.values()) {
        console.log(
          value,
          parentValue,
          node.probabilityTable.conditionalProbability(value, [parentValue])
        )
        result += node.probabilityTable.conditionalProbability(value, [
          parentValue,
        ])
      }
      return result
    }

    // if node has parents and something else is also given
    // TODO: what do we do here?

    if (node.parents.size === 0) {
      return node.probabilityTable.conditionalProbability(value, [])
    }

    const parentNodeNames = [...node.parents.values()].map(
      (parent) => parent.name
    )
    if (parentNodeNames.length === 1) {
      return node.probabilityTable.conditionalProbability(value, [
        given[parentNodeNames[0]],
      ])
    } else {
      throw new Error(
        "Not yet implemented: multiple parents are not supported yet"
      )
    }
  }

  sample(variableNames: Set<string>, given: Observation): Observation {
    // nothing is given:
    if (Object.keys(given).length === 0) {
      const result: Observation = {}

      const model: Map<string, string> = new Map()

      const nextNodes: NetworkNode[] = Array.from(this.nodes.values()).filter(
        (node) => node.parents.size === 0
      )

      if (!nextNodes.length) {
        throw new Error("Illegal State: No nodes without parents found")
      }

      while (nextNodes.length > 0) {
        const currentNode = nextNodes.pop()!

        if (variableNames.has(currentNode.name)) {
          model.set(currentNode.name, currentNode.sample(model))
          if (variableNames.has(currentNode.name)) {
            result[currentNode.name] = model.get(currentNode.name)!
          }
        }

        for (const child of currentNode.children) {
          if (
            Array.from(child.parents.values()).every((node) =>
              model.has(node.name)
            )
          )
            nextNodes.push(child)
        }

        if (Object.keys(result).length === variableNames.size) {
          return result
        }
      }

      return result
    }

    throw new Error("Not yet implemented")
    return {}
  }

  MAP(variableNames: Set<string>, given: Observation): Observation {
    if (variableNames.size === 0) {
      throw new Error("Cannot find MAP of empty set")
    }
    let possibleConstellations: Array<Observation> = []

    for (const name of variableNames) {
      if (possibleConstellations.length === 0) {
        possibleConstellations = Array.from(
          this.nodes.get(name)!.range.values()
        ).map((value) => ({ [name]: value }))
      } else {
        possibleConstellations = possibleConstellations.flatMap(
          (constellation) => {
            if (!this.nodes.has(name)) {
              throw new Error(`Node ${name} not found`)
            }

            return Array.from(this.nodes.get(name)!.range.values()).map(
              (value) => {
                return { ...constellation, [name]: value }
              }
            )
          }
        )
      }
    }
    let currentBest: Observation | undefined = undefined
    let currentBestProb = 0

    for (const constellation of possibleConstellations) {
      const currentProb = this.probabilityOf(constellation, given)
      if (currentProb > currentBestProb) {
        currentBest = constellation
        currentBestProb = currentProb
      }
    }

    if (currentBest) {
      // console.log("found MAP with probability score of", currentBestProb)
      return currentBest
    }
    throw new Error("Illegal State: no best constellation found")
  }
}
