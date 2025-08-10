# budget_brain_bayes.py
import math
import numpy as np
from dataclasses import dataclass
from typing import Dict, Tuple

# ---------- helpers

def clamp(x: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, x))

def sigmoid(z: float) -> float:
    return 1.0 / (1.0 + math.exp(-z))

def logit(p: float) -> float:
    p = clamp(p, 1e-6, 1 - 1e-6)
    return math.log(p / (1 - p))

def invlogit(mu: float, sd: float, rng: np.random.Generator) -> float:
    return sigmoid(rng.normal(mu, sd))

# ---------- posterior parameterization

def posterior_rate_logit_space(mean: float,
                               std_rate: float,
                               mu_prior: float = None,
                               sigma_prior: float = 1.0) -> Tuple[float, float]:
    """
    Bayesian update for a probability (CTR/CVR) in logit space.
    - We approximate measurement noise using delta-method: std on logit scale.
    - Prior: logit(p) ~ N(mu_prior, sigma_prior^2). If mu_prior None, use mean.
    - Likelihood proxy: N(mu_obs, sigma_obs^2) where mu_obs=logit(mean).
    Returns (mu_post, sd_post) for logit(p).
    """
    m = clamp(mean, 1e-6, 1 - 1e-6)
    # delta-method: Var[logit(p)] ≈ Var[p] / (m^2 (1-m)^2)
    var_rate = max(std_rate, 1e-8) ** 2
    denom = max(m * (1 - m), 1e-6) ** 2
    sigma_obs = math.sqrt(var_rate / denom)
    mu_obs = logit(m)

    if mu_prior is None:
        mu_prior = mu_obs  # weakly-informative: center prior on obs mean
    var_prior = sigma_prior ** 2
    var_post = 1.0 / (1.0 / var_prior + 1.0 / (sigma_obs ** 2))
    mu_post = var_post * (mu_prior / var_prior + mu_obs / (sigma_obs ** 2))
    return mu_post, math.sqrt(var_post)

def posterior_lognormal_from_cv(mean: float,
                                cv: float,
                                mu_prior: float = None,
                                sigma_prior: float = 1.0) -> Tuple[float, float]:
    """
    Bayesian update for positive skewed variable (CPM) as lognormal.
    - Observation: mean & CV -> log-space params (mu_obs, sd_obs)
    - Prior: log(CPM) ~ N(mu_prior, sigma_prior^2). If mu_prior None, use mu_obs.
    Returns (mu_post, sd_post) for log(CPM).
    """
    cv = max(cv, 1e-6)
    var_log = math.log(1 + cv ** 2)
    sd_obs = math.sqrt(var_log)
    mu_obs = math.log(max(mean, 1e-6)) - 0.5 * var_log

    if mu_prior is None:
        mu_prior = mu_obs
    var_prior = sigma_prior ** 2
    var_post = 1.0 / (1.0 / var_prior + 1.0 / (sd_obs ** 2))
    mu_post = var_post * (mu_prior / var_prior + mu_obs / (sd_obs ** 2))
    return mu_post, math.sqrt(var_post)

# ---------- joint sampling with a latent Quality factor

@dataclass
class LatentLoadings:
    lambda_ctr: float = 0.40
    lambda_cvr: float = 0.30
    lambda_cpm: float = 0.15  # small tie to CPM

@dataclass
class ResidualScales:
    sd_ctr_resid: float = 0.25  # on logit scale
    sd_cvr_resid: float = 0.25  # on logit scale
    sd_cpm_resid: float = 0.20  # on log scale

def sample_joint_posteriors(
    N: int,
    ctr_post: Tuple[float, float],  # (mu_logit_ctr, sd_logit_ctr)  -- used as centers
    cvr_post: Tuple[float, float],
    cpm_post: Tuple[float, float],  # (mu_log_cpm, sd_log_cpm)
    loadings: LatentLoadings = LatentLoadings(),
    resid: ResidualScales = ResidualScales(),
    seed: int = 42
) -> np.ndarray:
    """
    Returns array of shape (N, 3): columns [CPM, CTR, CVR].
    We keep marginal centers at the provided posteriors and add correlation via latent Quality.
    """
    rng = np.random.default_rng(seed)
    mu_ctr, sd_ctr = ctr_post
    mu_cvr, sd_cvr = cvr_post
    mu_cpm, sd_cpm = cpm_post

    # Blend: residual sds determine marginal spread; latent adds correlation.
    # We ensure residual variance roughly preserves posterior sd if wanted:
    # (You can tune resid.* to widen/narrow.)
    out = np.zeros((N, 3), dtype=float)
    for i in range(N):
        q = rng.normal(0.0, 1.0)  # latent Quality
        # CTR
        z_ctr = rng.normal(0.0, resid.sd_ctr_resid)
        logit_ctr = mu_ctr + loadings.lambda_ctr * q + z_ctr
        ctr = sigmoid(logit_ctr)
        # CVR
        z_cvr = rng.normal(0.0, resid.sd_cvr_resid)
        logit_cvr = mu_cvr + loadings.lambda_cvr * q + z_cvr
        cvr = sigmoid(logit_cvr)
        # CPM
        z_cpm = rng.normal(0.0, resid.sd_cpm_resid)
        ln_cpm = mu_cpm + loadings.lambda_cpm * q + z_cpm
        cpm = math.exp(ln_cpm)
        out[i, 0] = cpm
        out[i, 1] = ctr
        out[i, 2] = cvr
    return out

# ---------- summaries & certainty

def pct(arr: np.ndarray, q: float) -> float:
    return float(np.percentile(arr, q))

def summarize_metric(samples: np.ndarray, window_frac: float = 0.15) -> Dict[str, float]:
    p10 = pct(samples, 10)
    p50 = pct(samples, 50)
    p90 = pct(samples, 90)
    # Relative CI width
    w = (p90 - p10) / (abs(p50) + 1e-8)
    target_w = 0.6  # tune this: 60% relative width ~ 50% certainty
    certainty_pct = max(0.0, min(100.0, 100.0 * (1.0 - w / target_w)))
    within = np.mean(np.abs(samples - p50) <= window_frac * (abs(p50) + 1e-8))
    return {
        "p10": p10, "p50": p50, "p90": p90,
        "certainty_pct": 100.0 * within,        # window-based certainty
        "stability_pct": certainty_pct          # CI-width-based certainty
    }

# ---------- main entry

def bayes_monte_carlo_metrics(
    *,
    cpm_mean: float, cpm_cv: float,
    ctr_mean: float, ctr_std: float,
    cvr_mean: float, cvr_std: float,
    N: int = 5000,
    seed: int = 123
) -> Dict[str, Dict[str, float]]:
    """
    Inputs:
      - cpm_mean (USD), cpm_cv (e.g., 0.25 for 25%)
      - ctr_mean, ctr_std (rates, e.g., 0.018, 0.006)
      - cvr_mean, cvr_std (rates)
    Outputs: summaries for CPM, CTR, CVR each with p10/p50/p90 and certainty%.
    """
    # Posterior params
    mu_logit_ctr, sd_logit_ctr = posterior_rate_logit_space(ctr_mean, ctr_std)
    mu_logit_cvr, sd_logit_cvr = posterior_rate_logit_space(cvr_mean, cvr_std)
    mu_log_cpm, sd_log_cpm     = posterior_lognormal_from_cv(cpm_mean, cpm_cv)

    # Center the residual scales around posterior SDs (optional refinement)
    # If you want marginal sd ≈ posterior sd, you can replace the ResidualScales values
    # with sd_logit_ctr/sd_logit_cvr/sd_log_cpm.
    samples = sample_joint_posteriors(
        N,
        (mu_logit_ctr, sd_logit_ctr),
        (mu_logit_cvr, sd_logit_cvr),
        (mu_log_cpm,   sd_log_cpm),
        seed=seed
    )

    cpm_s = samples[:, 0]
    ctr_s = samples[:, 1]
    cvr_s = samples[:, 2]

    return {
        "CPM": summarize_metric(cpm_s),
        "CTR": summarize_metric(ctr_s),
        "CVR": summarize_metric(cvr_s)
    }

# ---------- quick demo

if __name__ == "__main__":
    # Example inputs (per channel) — replace with your 24h stream aggregates.
    # CPM = $8 with 25% CV; CTR = 1.8% ± 0.6%; CVR = 4.0% ± 1.5%
    result = bayes_monte_carlo_metrics(
        cpm_mean=8.0, cpm_cv=0.25,
        ctr_mean=0.018, ctr_std=0.006,
        cvr_mean=0.040, cvr_std=0.015,
        N=5000, seed=7
    )
    from pprint import pprint
    pprint(result)
