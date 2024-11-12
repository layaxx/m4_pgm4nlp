import { Network } from "./network"
import { NetworkNode } from "./node"
import { ProbabilityTable } from "./probability-table"

function init(
  length: number,
  vocabulary: Set<string>,
  partOfSpeechTags: Set<string>
) {
  const network = new Network()

  const cptPartOfSpeech = new ProbabilityTable(partOfSpeechTags.size)
  const cptToken = new ProbabilityTable(vocabulary.size)

  let previousPOSNode: NetworkNode | undefined
  Array.from({ length }, (_, i) => i + 1).forEach((i) => {
    const newPOSNode = new NetworkNode(
      "pos" + i,
      partOfSpeechTags,
      new Set(previousPOSNode ? [previousPOSNode] : []),
      cptPartOfSpeech
    )
    const newTokenNode = new NetworkNode(
      "tok" + i,
      vocabulary,
      new Set([newPOSNode]),
      cptToken
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
