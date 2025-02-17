import { expectationOfS, probabilityMassOfS, varianceOfS } from "./s.ts"

const LARGE_VALUE = 1_000_000

function probabilityMass(k: number): number {
  if (k < 1) return 0
  // prob of k => hitting k-1 times anything but 1, then hitting 1
  // 1 => 1/6
  // 2 => 5/6 * 1/6
  // 3 => 5/6 * 5/6 * 1/6

  // => (5/6)^(k-1) * 1/6

  return Math.pow(5 / 6, k - 1) * (1 / 6)
}

function expectedValue(): number {
  // weighted sum of values (weighted by probability)
  let sum = 0
  for (let i = 0; i < LARGE_VALUE; i++) {
    sum += i * probabilityMass(i)
  }
  return sum
}

function entropy(): number {
  // average information content: - sum(prob * log prob)
  const sum = Array.from(
    { length: 3000 }, // gives NaN for larger values
    (_, i) => probabilityMass(i + 1) // ged rid of 0
  ).reduce((prev, curr) => prev + curr * Math.log(curr), 0)
  return -sum
}

function entropy2() {
  let sum = 0

  for (let i = 1; i < 3000; i++) {
    // gives NaN for larger values
    const prob = probabilityMass(i)
    sum += prob * Math.log(prob)
  }

  return -1 * sum
}

function newProbabilityMass(k: number): number {
  if (k < 1) return 0
  // prob of k => hitting k-1 times anything but 1, then hitting 1
  // 1 => 2/6
  // 2 => 4/6 * 2/6
  // 3 => 4/6 * 4/6 * 2/6

  // => (4/6)^(k-1) * 2/6

  // obv. could be simplified to 2/3 and 1/3

  return Math.pow(4 / 6, k - 1) * (2 / 6)
}

function newExpectedValue(): number {
  // weighted sum of values (weighted by probability)
  let sum = 0
  for (let i = 0; i < LARGE_VALUE; i++) {
    sum += i * newProbabilityMass(i)
  }
  return sum
}

function kullbackLeiblerDivergence() {
  // Dkl(p||q) sum of p(x) * log (p(x)/q(x))
  // Dkl(k'||k) => sum of newProbabilityMass(x) * log(newProbabilityMass(x)/probabilityMass(x))
  return Array.from({ length: 1800 }, (_, i) => {
    // larger values give NaN
    const x = i + 1 // start with 1
    const newProb = newProbabilityMass(x)
    const oldProb = probabilityMass(x)
    return newProb * Math.log(newProb / oldProb)
  }).reduce((a, b) => a + b)
}

;(function main() {
  console.log("Probability mass of k, first 10 values")
  for (let i = 1; i < 10; i++) {
    console.log(i, probabilityMass(i))
  }

  console.log("Expectation normal die", expectedValue())

  console.log("Entropy normal die (func, loop)", entropy(), entropy2())

  console.log("Probability mass of s, first 10 values")
  for (let i = 1; i < 10; i++) {
    console.log(i, probabilityMassOfS(i))
  }

  console.log("Expectation of s (sum of rolls)", expectationOfS())
  console.log("Variance of s (sum of rolls", varianceOfS())

  console.log(
    "Kullback-Leibler Divergence (trick die, die)",
    kullbackLeiblerDivergence()
  )

  console.log("Expectation trick die", newExpectedValue())
})()
