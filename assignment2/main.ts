import { Network } from "./network"
import { NetworkNode } from "./node"
import { ProbabilityTable } from "./probability-table"
import fs from "node:fs"
import { createInterface } from "node:readline"

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

  return network
}

function normalizeToken(token: string) {
  return token.toLowerCase()
}

async function analyzeTrainingSet(): Promise<{
  longestLine: number
  tags: Set<string>
  tokens: Set<string>
  rareTokens: Set<string>
}> {
  const tags = new Set<string>()
  const tokens = new Map<string, number>()
  const fileStream = fs.createReadStream("data/train.txt")

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })

  let longestLine = 0
  let currentLine = 0

  for await (const line of rl) {
    if (line.trim().length === 0) {
      longestLine = Math.max(longestLine, currentLine)
      currentLine = 0
    } else {
      let [token, tag] = line.split(" ")

      token = normalizeToken(token)

      if (tokens.has(token)) {
        tokens.set(token, tokens.get(token)! + 1)
      } else {
        tokens.set(token, 1)
      }
      tags.add(tag)
      currentLine++
    }
  }

  console.debug(tags.size, "tags and", tokens.size, "tokens")

  const rareTokens = [...tokens.entries()].filter(([_, count]) => count < 3)

  console.debug("rare tokens", rareTokens.length)
  console.debug("longest line", longestLine)

  return {
    longestLine,
    tags,
    tokens: new Set(tokens.keys()),
    rareTokens: new Set(rareTokens.map(([name]) => name)),
  }
}

async function getObservations(
  rareTokens: Set<string>
): Promise<Array<{ [key: string]: string }>> {
  const fileStream = fs.createReadStream("data/train.txt")

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })

  const observations: Array<{ [key: string]: string }> = []

  let currentObservation = { tok1: "BOS", pos1: "BOS" }
  let counter = 2

  for await (const line of rl) {
    if (line.trim().length === 0) {
      currentObservation["pos" + counter] = "EOS"
      currentObservation["tok" + counter] = "EOS"
      observations.push(currentObservation)
      currentObservation = { tok1: "BOS", pos1: "BOS" }
      counter = 2
    } else {
      const [token, tag] = line.split(" ")

      const normalizedToken = normalizeToken(token)

      currentObservation["tok" + counter] = rareTokens.has(normalizedToken)
        ? "OOV"
        : normalizedToken
      currentObservation["pos" + counter] = tag

      counter++
    }
  }

  return observations
}

async function main() {
  const { longestLine, rareTokens, tags, tokens } = await analyzeTrainingSet()

  const network = init(longestLine + 2, tokens, tags)

  const observations = await getObservations(rareTokens)

  network.train(observations)
}

main()
