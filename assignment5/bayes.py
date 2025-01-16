import random
from itertools import product
from collections import defaultdict


class Node:
    def __init__(self, name, _range, parents, cpf):
        self.name = name
        self._range = set(_range)
        self.parents = parents[:]
        self.children = []
        self.cpf = cpf
        for p in self.parents:
            p.children.append(self)

    def p(self, node_value, parent_values):
        return self.cpf.p(node_value, parent_values)


class CPF:
    def __init__(self, _range: set):
        self._range = _range
        self.table = {}

    def update(self, node_value, parent_values):
        parent_values = tuple(parent_values)
        if parent_values not in self.table:
            # add 0.01 smoothing
            self.table[parent_values] = {k: 0.01 for k in self._range}
        self.table[parent_values][node_value] += 1

    def p(self, node_value, parent_values):
        parent_values = tuple(parent_values)
        if parent_values not in self.table:
            return 1 / len(self._range)
        else:
            sm = sum(self.table[parent_values].values())
            return self.table[parent_values][node_value] / sm


class BayesNet:
    def __init__(self):
        self.nodes = {}

    def add(self, node):
        self.nodes[node.name] = node

    def learn(self, observations):
        for observation in observations:
            for node in self.nodes.values():
                # check if this node is observed, and if all parents are observed
                # if so, update it
                if node.name in observation:
                    node_value = observation[node.name]
                    parent_values = []
                    for parent in node.parents:
                        if parent.name in observation:
                            parent_values.append(observation[parent.name])
                        else:
                            break
                    else:
                        # we are fully observed
                        node.cpf.update(node_value, parent_values)

    def p(self, y, x=None):
        if x is not None:
            # p(y | x) = p(y, x) / p(x)
            return self.p(y | x) / self.p(x)
        latents = self.nodes.keys() - y.keys()
        if len(latents) > 0:
            # recurse over the latents, summing up over all possible values
            lat = next(iter(latents))
            sm = 0
            for lat_val in self.nodes[lat]._range():
                sm += self.p(y | {lat: lat_val})
            return sm
        else:
            prod = 1
            for yvar, yval in y.items():
                node = self.nodes[yvar]

                parent_values = []
                for parent in node.parents:
                    parent_values.append(y[parent.name])
                prod *= node.cpf.p(yval, parent_values)
            return prod

    def sample(self, Y, x):
        sampled = {}
        while len(sampled) < len(Y):
            known = sampled | x
            # pick a node for which we know the parents' values
            for s_node in self.nodes.values():
                if s_node.name in sampled:
                    continue
                parents_known = True
                for p in s_node.parents:
                    if p.name not in known:
                        parents_known = False
                        break
                if parents_known:
                    break
            parent_values = [known[p.name] for p in s_node.parents]
            probs = {x: s_node.cpf.p(x, parent_values) for x in s_node._range}
            vs = []
            ps = []
            for v, p in probs.items():
                vs.append(v)
                ps.append(p)
            value = random.choices(vs, weights=ps)[0]
            if s_node.name in x and x[s_node.name] != value:
                # oops, restart
                sampled = {}
            else:
                sampled[s_node.name] = value
        return sampled

    def map(self, Y, x):
        ranges = [self.nodes[y]._range for y in Y]
        best = None
        best_p = None
        for v in product(*ranges):
            obs = {y: yv for y, yv in zip(Y, v)}
            p = self.p(obs, x)
            if best is None or p > best_p:
                best_p = p
                best = obs
        return best


def make_chain(vocab, pos_tags, k):
    net = BayesNet()

    tok_cpf = CPF(vocab)
    pos_cpf = CPF(pos_tags)

    for i in range(k):
        if i > 0:
            pars = [net.nodes[f"pos{i-1}"]]
        else:
            pars = []
        pos = Node(f"pos{i}", pos_tags, pars, pos_cpf)
        tok = Node(f"tok{i}", vocab, [pos], tok_cpf)

        net.add(pos)
        net.add(tok)

    return net


def normalize(word):
    word = word.lower()
    for dig in "123456789":
        word = word.replace(dig, "0")
    return word


def load(corpus_path):
    sents = []
    with open(corpus_path, "r") as f:
        sent = []
        for line in f:
            line = line.strip()
            if len(line) == 0:
                if len(sent) > 0:
                    sents.append([("BOS", "BOS")] + sent + [("EOS", "EOS")])
                    sent = []
            else:
                word, pos, chunk_tag = line.split()
                word = normalize(word)
                sent.append((word, pos))
    return sents


def make_obs(sent, vocab, max_len=None, include_labels=True):
    observation = {}
    if max_len is not None:
        sent = sent[:max_len]
        while len(sent) < max_len:
            sent.append(("PAD", "PAD"))
    for i, (toki, posi) in enumerate(sent):
        if toki not in vocab:
            toki = "OOV"
        observation[f"tok{i}"] = toki
        if include_labels:
            observation[f"pos{i}"] = posi
    return observation


def train(sents, max_len=100):
    tags = {t[1] for s in sents for t in s}
    vocab = {t[0] for s in sents for t in s}

    word_counts = defaultdict(int)
    for s in sents:
        for tok, _ in s:
            word_counts[tok] += 1

    vocab = {w for w in word_counts if word_counts[w] >= 10}

    vocab.add("PAD")
    vocab.add("OOV")

    tags.add("PAD")

    net = make_chain(vocab, tags, max_len)

    observations = []
    for sent in sents:
        observations.append(make_obs(sent, vocab, max_len))
    net.learn(observations)
    return net


if __name__ == "__main__":
    sents = load("../train.txt")
    net = train(sents)
    # Y = list(net.nodes.keys())
    # print(net.sample(Y, {}))

    obs = make_obs(sents[0])
    for k in net.nodes.keys() - obs.keys():
        obs[k] = "EOS"
    x = {k: v for k, v in obs.items() if k.startswith("tok")}
    y = {k: v for k, v in obs.items() if k.startswith("pos")}
    # print(net.p(y, x))
    # print(net.map(y.keys(), x))
