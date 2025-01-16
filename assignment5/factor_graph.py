from bayes import load, train, make_obs


class Variable:
    def __init__(self, name, _range):
        self.name = name
        self._range = _range
        self.factors = []


class Factor:
    def __init__(self, name, variables, f):
        self.name = name
        self.variables = variables[:]
        self.f = f
        for variable in variables:
            variable.factors.append(self)


class FactorGraph:
    def __init__(self):
        self.variables = {}
        self.factors = {}

    def p_unnorm(self, obs):
        prod = 1
        for factor in self.factors:
            vals = [obs[var.name] for var in factor.variables]
            prod *= factor.f(vals)
        return prod


def from_bayesnet(bn):
    fg = FactorGraph()
    # add all the variable nodes first
    for name, node in bn.nodes.items():
        var = Variable(name, node._range)
        fg.variables[name] = var
    # then add the factors
    for name, node in bn.nodes.items():
        variables = [fg.variables[name]]
        for parent in node.parents:
            variables.append(fg.variables[parent.name])

        # Since python handles closures in a weird way, we need to do this
        def make_factor_func(node):
            return lambda values: node.cpf.p(values[0], values[1:])

        f = make_factor_func(node)
        fname = "f_" + name
        factor = Factor(fname, variables, f)
        fg.factors[fname] = factor
    return fg


if __name__ == "__main__":
    sents = load("train.txt")
    bn = train(sents)
    fg = from_bayesnet(bn)
    obs = make_obs(sents[0])
    for var in fg.variables:
        if var not in obs:
            obs[var] = "EOS"
    print(bn.p(obs))
    print(fg.p_unnorm(obs))
