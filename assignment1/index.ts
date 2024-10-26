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
  for (let i = 0; i < 1_000_000; i++) {
    sum += i * probabilityMass(i)
  }
  return sum
}

;(function main() {
  for (let i = 1; i < 100; i++) {
    console.log(i, probabilityMass(i))
  }

  console.log("expected Value", expectedValue())
})()
