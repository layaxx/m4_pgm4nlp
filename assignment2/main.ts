import { Network } from "./network"
import { NetworkNode } from "./node"

function init(
  length: number,
  vocabulary: Set<string>,
  partOfSpeechTags: Set<string>
) {
  const network = new Network()
  let previousPOSNode: NetworkNode | undefined
  Array.from({ length }, (_, i) => i + 1).forEach((i) => {
    const newPOSNode = new NetworkNode(
      "pos" + i,
      partOfSpeechTags,
      new Set(previousPOSNode ? [previousPOSNode] : [])
    )
    const newTokenNode = new NetworkNode(
      "tok" + i,
      vocabulary,
      new Set([newPOSNode])
    )
    previousPOSNode = newPOSNode
    network.nodes.set(newTokenNode.name, newTokenNode)
    network.nodes.set(newPOSNode.name, newPOSNode)
  })

  console.log(
    network.nodes
      .get("pos7")
      ?.probabilityTable.conditionalProbability("hello", ["no", "not", "it"])
  )
}

init(8, new Set(["hello", "world"]), new Set(["stop", "it", "right", "now"]))
