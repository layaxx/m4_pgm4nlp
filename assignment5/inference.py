import sys
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

    unobserved_vars = []

    # initialize unobserved variables uniformly randomly
    pred = {}
    pred.update(evidence)
    for vname, var in fg.variables.items():
        if vname not in pred:
            pred[vname] = random.choice(list(var._range))
            unobserved_vars.append(vname)

    """
    Fill in the rest here!!!
    """

    # repeat n times
    for _ in range(n_steps):
        # choose random variable
        var_to_be_updated = random.choice(unobserved_vars)

        node = fg.variables[var_to_be_updated]

        # update this variable
        agreements = []

        values = list(node._range)
        for possible_value in values:
            agreement = 1
            for factor in node.factors:
                vals = [
                    (
                        possible_value
                        if var.name == var_to_be_updated
                        else pred[var.name]
                    )
                    for var in factor.variables
                ]
                agreement *= factor.f(vals) ** temp
            agreements.append(agreement)

        pred[var_to_be_updated] = random.choices(values, weights=agreements, k=1)[0]

    return pred


def calculate_v2f_message(variable, f2v_messages, v2f_messages):
    val = random.choice(list(variable._range))
    message = {val: 1}
    for valprime in variable._range:
        if valprime != val:
            message[valprime] = 0

    return message


def calculate_f2v_message(factor, v2f_messages, f2v_messages):
    message = {"val": 1}

    return message


def find_calculable_message(
    fg, unsent_f2v_messages, unsent_v2f_messages, f2v_messages, v2f_messages
):
    """
    Find the next calculable message in a factor graph.

    This function iterates over the unsent f2v and v2f messages to find the
    next message that can be calculated. A message is considered
    calculable if all the required incoming messages are present.

    Args:
        fg: The factor graph containing factors and variables.
        unsent_f2v_messages (list): List of unsent factor-to-variable messages.
        unsent_v2f_messages (list): List of unsent variable-to-factor messages.
        f2v_messages (set): Set of sent factor-to-variable messages.
        v2f_messages (set): Set of sent variable-to-factor messages.

    Returns:
        tuple: A tuple containing the calculable message and a boolean flag
               indicating the type of message. The boolean flag is True if
               the message is a factor-to-variable message, and False if it
               is a variable-to-factor message.
    """

    for message in unsent_f2v_messages:
        factor_name, variable_name = message
        factor = fg.factors[factor_name]
        variable = fg.variables[variable_name]

        # check every node in the factor but the target node has sent a message
        if all(
            (v.name, factor_name) in v2f_messages
            for v in factor.variables
            if v != variable
        ):
            return message, True

    for message in unsent_v2f_messages:
        variable_name, factor_name = message
        variable = fg.variables[variable_name]
        factor = fg.factors[factor_name]

        # check if every connected factor but the target factor has sent a message
        if all(
            (f.name, variable_name) in f2v_messages
            for f in variable.factors
            if f != factor
        ):
            return message, False


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
        the value of that vector for the assignment (v1=val1, v2=val2, v3=val3),
        use:
            fact.f((val1, val2, val3))

        Factors and variables are objects, but have string names.
        To convert between the two, use factor.name or variable.name to
        get the name, or fg.variables[name] or fg.factors[name] to get
        the object.


    """

    # YOUR CODE HERE!

    # use itertools.product

    unsent_v2f_messages = set(v2f_message_names) - set(v2f_messages.keys())
    unsent_f2v_messages = set(f2v_message_names) - set(f2v_messages.keys())

    # raise NotImplementedError

    # while there are unsent messages left
    while len(unsent_f2v_messages) + len(unsent_v2f_messages) > 0:
        response = find_calculable_message(
            fg, unsent_f2v_messages, unsent_v2f_messages, f2v_messages, v2f_messages
        )

        if response is None:
            print(f2v_messages.keys())
            print(v2f_messages.keys())
            raise Exception("No message to calculate, but still unsent messages left")

        message_to_calculate, is_factor_message = response

        print(message_to_calculate, is_factor_message)

        first, second = message_to_calculate

        if is_factor_message:
            f2v_messages[first, second] = calculate_f2v_message(
                fg.factors[first], v2f_messages, f2v_messages
            )
            unsent_f2v_messages.remove(message_to_calculate)
        else:
            v2f_messages[first, second] = calculate_v2f_message(
                fg.variables[first], f2v_messages, v2f_messages
            )
            unsent_v2f_messages.remove(message_to_calculate)

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
    factor_graph = from_bayesnet(bn)

    vocab = factor_graph.variables["tok0"]._range

    test_sents = load("test.txt")
    test_obs = [
        make_obs(s, vocab, max_len=20, include_labels=False) for s in test_sents
    ]
    gold_obs = [make_obs(s, vocab, max_len=20, include_labels=True) for s in test_sents]
    bp_pred_obs = []
    gibbs_pred_obs = []
    for index, observation in enumerate(test_obs):

        try:
            # without working in log space, we get division by zero
            # if we make the temperature much lower
            marginals = belief_prop(factor_graph, observation, temp=0.5)
            bp_pred = {}
            for var in marginals:
                bp_pred[var] = max(marginals[var], key=marginals[var].get)
            bp_pred_obs.append(bp_pred)

            print("BP Accuracy so far:", eval(bp_pred_obs, gold_obs))

        except NotImplementedError:
            sys.exit(0)
            pass

        gibbs_pred = gibbs(factor_graph, observation, 2000, temp=1)
        gibbs_pred_obs.append(gibbs_pred)

        print("Gibbs Accuracy so far:", eval(gibbs_pred_obs, gold_obs))
