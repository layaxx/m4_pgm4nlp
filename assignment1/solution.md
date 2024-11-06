# Solutions to Assignment 1 (NLProc-PGM4NLP-M)

## Part 1 - Independence

### a) Two random variables are independent

Two dice throws are independent from each other.

### b) Two random variables are causally linked

random variables: covidStatus and testResult

The probability that a person has COVID and the probability that the COVID-Test for the same person is positive (having COVID causes the positive Test).

### c) Two random variables that are causally linked but independent

flip 2 coins
if coin 1 heads, turn second 2. coin

only works for fair, non-weighted, coins

### d) Three random variables that are not pairwise independent but conditionally independent

a: whether it rains
b: whether a person takes an umbrella with them
c: whether the person gets wet

a and b are dependent: person takes umbrella if it rains
a and c are dependent: person gets wet if it rains
b and c are dependent: person does not get wet if it rains

conditioned on b, a and c are independent: person might get wet, rain has no effect on this

((The probability that a satellite looses power, that it falls apart and that it is hit by a (large and/or high energy) object.??))

### e) Three random variables a, b, and c such that all are pairwise independent, but are not jointly independent

a: coin toss (0 = HEADS, 1 = TAILS)
b: coin toss (0 = HEADS, 1 = TAILS)
c: a xor b

a:  HEADS   TAILS
    0.5     0.5

b:  HEADS   TAILS
    0.5     0.5

c:  1       0
    0.5     0.5
    H+T,T=H H+H,T+T

a and b are obv. independent.

a and c and b and c are pairwise independent. if we know either a or b, but not both, chance of c being 1 is still 0.5.

If we know a and b, we know c => not independent

### f) A random variable that is independent from itself

e.g. a die with same number on each side. => no new information (about this random variable) is (can be) gained by knowing the result

in general this only works for (any) random variables with (only) certain outcomes (i.e. 0 or 1), because P(A ^ A) = P(A) * P(A) = P(A) (definition of independent random variables), can only be true if P(A) element of {0, 1}.

## Part 2 - Programming

see `index.ts` (and partially `s.ts`) for the solutions. To run them, the node runtime is needed. Install dependencies (TypeScript) via `yarn`, then run `yarn tsx index.ts` to execute.
