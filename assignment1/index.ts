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

;(function main() {
  for (let i = 1; i < 10; i++) {
    console.log(i, probabilityMass(i))
  }

  console.log("expected Value", expectedValue())

  console.log("entropy", entropy(), entropy2())

  for (let i = 1; i < 10; i++) {
    console.log(i, probabilityMassOfS(i))
  }

  console.log("expectation of S", expectationOfS())
  console.log("variance of S", varianceOfS())
})()
