from scipy.stats import norm
import numpy as np
from scipy.optimize import fsolve

P_avg = 3.5  # average payout
P_max = 5  # max payout (at 99th percentile)


def equations(params):
    mu, sigma = params
    eq1 = np.exp(mu + sigma**2 / 2) - P_avg
    eq2 = np.exp(mu + sigma * norm.ppf(0.99)) - P_max
    return [eq1, eq2]


mu, sigma = fsolve(equations, [6, 1])


# Now compute payout for any score s:
def payout(s):
    s = np.clip(s, 1e-6, 1 - 1e-6)  # avoid ±∞
    return np.exp(mu + sigma * norm.ppf(s))


print(payout(0.5))  # median score → ~average payout
print(payout(0.99))  # top score → max payout
