# PGM4NLP: Assignment 2

## How to execute

First time: run `yarn` to install the typescript runtime (I use Node 18, later versions should also work fine).

Run `yarn tsx main.ts` to execute.

## Known issues

Some of the probabilities returned by `Network#probabilityOf()` are greater than 1. 

Due to time constraints on my part, this method currently also only works at all under some assumptions, such as: no more than two observation at a time, given values must be parents, not children.

As show below, I believe this to work well enough for simple MAP-inference tasks.

## MAP inference

I think this works correctly, with the caveat that `Network#probabilityOf()` is not complete and sometimes returns incorrect values.

Time (and space) complexity is obviously not great, as all possible solutions are generated and evaluated, but this should be okay for this assignment.

Examples (also included in the code, just run `yarn tsx main.ts`):

`network.MAP(new Set(["tok2"]), { pos2: "." })` => `{ tok2: "." }`

=> What is the most likely token for the Part-Of-Speech Tag "." => "." => Seems correct.

`network.MAP(new Set(["tok16", "pos16"]), { pos15: "." }) => { tok16: 'EOS', pos16: 'EOS' }`

=> What is the most likely combination of tag and token for position 16, given that the POS-Tag on position 15 is "." => EOS for both, makes sense, as a dot likely marks the end of a sentence.

`network.MAP(new Set(["tok1", "pos1"]), {})` => `{ tok1: 'BOS', pos1: 'BOS' }`

=> What is the most likely combination of tag and token for position 1 => BOS for both, makes sense, all sentences start with BOS.

`network.MAP(new Set(["tok20", "pos20"]), {})` => `{ tok1: 'BOS', pos1: 'BOS' }`

=> I am unsure if this is to be expected. I think it makes sense that the BOS tag+token pair is the most likely if we disregard parents, but I am not sure if parents should have been considered here.

## Expected Output of running `yarn tsx main.ts`

```text
44 tags and 17258 tokens
rare tokens 10933
longest line 78
probability of EOS following a .: 0.9368981533929988
MAP(tok2) given pos2=. => { tok2: '.' }
MAP(tok16,pos16) given pos15=. => { tok16: 'EOS', pos16: 'EOS' }
MAP(tok1,pos1) given nothing => { tok1: 'BOS', pos1: 'BOS' }
MAP(tok20,pos20) given nothing => { tok20: 'BOS', pos20: 'BOS' }
Done in 5.32s.
```
