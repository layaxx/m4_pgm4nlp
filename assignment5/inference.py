from bayes import load, train, make_obs
from factor_graph import from_bayesnet


import random


def gibbs(fg, evidence, n_steps, temp=1):
    """
    Takes a factor graph, runs n_steps of Gibbs sampling, then returns a full
    observation of all variables
    Evidence is a partial observation of the values of some variables.

    Return a full observation -- keys are variable names, values are variable values
    """

    # initialize unobserved variables uniformly randomly
    pred = {}
    pred.update(evidence)
    for vname, var in fg.variables.items():
        if vname not in pred:
            pred[vname] = random.choice(list(var._range))

    """
    Fill in the rest here!!!
    """
    raise NotImplementedError

    return pred


def belief_prop(fg, evidence, temp=1):
    """
    You will be modifying this function. The goal is to calculate all messages.
    We keep track of variable-to-factor (v2f) and factor-to-variable (f2v) messages
    separately.
    For convenience, each message has a "name" (actually a tuple, not string):
    a v2f message's name is a tuple of (variable_name, factor_name),
    and a f2v message's name is a tuple of (factor_name, variable_name).

    Messages themselves will be represented as dictionaries: dict keys are
    the possible values the variable can take on,
    and dict values are non-negative numbers.
    """

    """
    First let's determine what the names of all our messages will be.
    For each name, we will need to compute the message.
    This part is done for you.
    """
    v2f_message_names = []
    for vname, var in fg.variables.items():
        for fact in var.factors:
            v2f_message_names.append((vname, fact.name))

    f2v_message_names = []
    for fname, fact in fg.factors.items():
        for var in fact.variables:
            f2v_message_names.append((fname, var.name))

    """
    Now we know the names of all the messages we need, we just need to
    compute the actual messages.
    We will store all of our messages in dicts: v2f_messages and f2v_messages.
    The keys to these dicts will be the message names we computed above, and the
    values will be the actual messages.
    """

    v2f_messages = {}
    f2v_messages = {}

    """
    For all the evidence variables, we can send out
    one-hot vectors as messages to and from them.
    This is done already.
    """

    for vname, val in evidence.items():
        var = fg.variables[vname]
        message = {val: 1}
        for valprime in var._range:
            if valprime != val:
                message[valprime] = 0

        for v, f in v2f_message_names:
            if v == vname:
                v2f_messages[v, f] = message
        for f, v in f2v_message_names:
            if v == vname:
                f2v_messages[f, v] = message

    """
    Now we need to compute the rest of our messages.
    This is where you come in.


    YOUR TASK:
        - Based on the contents of our dicts f2v_messages and v2f_messages,
            find a message which we are ready to calculate
        - Calculate the value of that message.
        - Store its value in the dict.
        - Rinse and repeat, until all messages have been calculated.

    USEFUL PIECES OF SYNTAX:
        If a factor fact has variables v1, v2, and v3, and you want to compute
        the value of that vactor for the assignment (v1=val1, v2=val2, v3=val3),
        use:
            fact.f((val1, val2, val3))

        Factors and variables are objects, but have string names.
        To convert between the two, use factor.name or variable.name to
        get the name, or fg.variables[name] or fg.factors[name] to get
        the object.


    """

    # YOUR CODE HERE!
    raise NotImplementedError

    """
    Now all messages have been passed. Let's calculate our marginals
    """
    marginals = {}
    for vname, var in fg.variables.items():
        # unscaled marginal should be the product of all incoming messages
        umarginal = {}
        for k in var._range:
            umarginal[k] = 1
        for (f, v), message in f2v_messages.items():
            if v == var.name:
                for k in umarginal:
                    umarginal[k] *= message[k]

        z = sum(umarginal.values())
        marginal = {k: v / z for k, v in umarginal.items()}
        marginals[var.name] = marginal

    return marginals


def eval(predictions, golds):
    """
    Simple accuracy
    """
    n_correct = 0
    n = 0
    for pred, gold in zip(predictions, golds):
        for var in gold:
            if var.startswith("pos"):
                if gold[var] not in {"BOS", "EOS", "PAD"}:
                    n += 1
                    if pred[var] == gold[var]:
                        n_correct += 1
    return n_correct / n


if __name__ == "__main__":
    train_sents = load("train.txt")
    bn = train(train_sents, max_len=20)
    fg = from_bayesnet(bn)

    vocab = fg.variables["tok0"]._range

    test_sents = load("test.txt")
    test_obs = [
        make_obs(s, vocab, max_len=20, include_labels=False) for s in test_sents
    ]
    gold_obs = [make_obs(s, vocab, max_len=20, include_labels=True) for s in test_sents]
    bp_pred_obs = []
    gibbs_pred_obs = []
    for obs in test_obs:

        try:
            # without working in log space, we get division by zero
            # if we make the temperature much lower
            marginals = belief_prop(fg, obs, temp=0.5)
            bp_pred = {}
            for var in marginals:
                bp_pred[var] = max(marginals[var], key=marginals[var].get)
            bp_pred_obs.append(bp_pred)

            print("BP Accuracy so far:", eval(bp_pred_obs, gold_obs))
        except NotImplementedError:
            pass

        try:
            gibbs_pred = gibbs(fg, obs, 2000, temp=1)
            gibbs_pred_obs.append(gibbs_pred)

            print("Gibbs Accuracy so far:", eval(gibbs_pred_obs, gold_obs))

        except NotImplementedError:
            pass
