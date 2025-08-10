// Import platform data directly
import platformDataJson from '../data/platformData.json';

// Helper functions (translated from Python)
function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function sigmoid(z) {
  return 1.0 / (1.0 + Math.exp(-z));
}

function logit(p) {
  return Math.log(p / (1.0 - p));
}

function normalRandom(mean = 0, std = 1) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * std + mean;
}

function posteriorRateLogitSpace(mean, stdRate, muPrior = null, sigmaPrior = 1.0) {
  const logitMean = logit(mean);
  const logitStd = stdRate / (mean * (1 - mean));
  
  let muPost, sigmaPost;
  if (muPrior !== null) {
    const precisionPrior = 1.0 / (sigmaPrior ** 2);
    const precisionData = 1.0 / (logitStd ** 2);
    const precisionPost = precisionPrior + precisionData;
    sigmaPost = Math.sqrt(1.0 / precisionPost);
    muPost = (precisionPrior * muPrior + precisionData * logitMean) / precisionPost;
  } else {
    muPost = logitMean;
    sigmaPost = logitStd;
  }
  
  return { mu: muPost, sigma: sigmaPost };
}

function posteriorLognormalFromCv(mean, cv, muPrior = null, sigmaPrior = 1.0) {
  const sigma2 = Math.log(1 + cv ** 2);
  const mu = Math.log(mean) - 0.5 * sigma2;
  const sigma = Math.sqrt(sigma2);
  
  let muPost, sigmaPost;
  if (muPrior !== null) {
    const precisionPrior = 1.0 / (sigmaPrior ** 2);
    const precisionData = 1.0 / (sigma ** 2);
    const precisionPost = precisionPrior + precisionData;
    sigmaPost = Math.sqrt(1.0 / precisionPost);
    muPost = (precisionPrior * muPrior + precisionData * mu) / precisionPost;
  } else {
    muPost = mu;
    sigmaPost = sigma;
  }
  
  return { mu: muPost, sigma: sigmaPost };
}

const LATENT_LOADINGS = {
  lambdaCtr: 0.40,
  lambdaCvr: 0.30,
  lambdaCpm: 0.15
};

const RESIDUAL_SCALES = {
  sdCtrResid: 0.25,
  sdCvrResid: 0.25,
  sdCpmResid: 0.20
};

function sampleJointPosteriors(N, ctrPost, cvrPost, cpmPost) {
  const samples = [];
  
  for (let i = 0; i < N; i++) {
    const latentFactor = normalRandom(0, 1);
    
    const ctrLogit = normalRandom(ctrPost.mu, ctrPost.sigma) + LATENT_LOADINGS.lambdaCtr * latentFactor;
    const cvrLogit = normalRandom(cvrPost.mu, cvrPost.sigma) + LATENT_LOADINGS.lambdaCvr * latentFactor;
    const cpmLog = normalRandom(cpmPost.mu, cpmPost.sigma) + LATENT_LOADINGS.lambdaCpm * latentFactor;
    
    const ctrResid = normalRandom(0, RESIDUAL_SCALES.sdCtrResid);
    const cvrResid = normalRandom(0, RESIDUAL_SCALES.sdCvrResid);
    const cpmResid = normalRandom(0, RESIDUAL_SCALES.sdCpmResid);
    
    const ctr = clamp(sigmoid(ctrLogit + ctrResid), 0.001, 0.999);
    const cvr = clamp(sigmoid(cvrLogit + cvrResid), 0.001, 0.999);
    const cpm = Math.exp(cpmLog + cpmResid);
    
    samples.push({ ctr, cvr, cpm });
  }
  
  return samples;
}

function percentile(arr, q) {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (q / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function summarizeMetric(samples, windowFrac = 0.15) {
  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;
  const windowSize = Math.max(1, Math.floor(n * windowFrac));
  const startIdx = Math.floor((n - windowSize) / 2);
  const endIdx = startIdx + windowSize;
  const windowSamples = sorted.slice(startIdx, endIdx);
  const windowMean = windowSamples.reduce((sum, val) => sum + val, 0) / windowSamples.length;
  
  return {
    p10: percentile(samples, 10),
    p50: percentile(samples, 50),
    p90: percentile(samples, 90),
    mean: samples.reduce((sum, val) => sum + val, 0) / samples.length,
    windowMean: windowMean,
    certainty_pct: (1.0 - (percentile(samples, 90) - percentile(samples, 10)) / (2 * percentile(samples, 50))) * 100,
    stability_pct: 0.0
  };
}

function bayesMonteCarloMetrics(cpmMean, cpmCv, ctrMean, ctrStd, cvrMean, cvrStd, N = 5000) {
  const ctrPost = posteriorRateLogitSpace(ctrMean, ctrStd);
  const cvrPost = posteriorRateLogitSpace(cvrMean, cvrStd);
  const cpmPost = posteriorLognormalFromCv(cpmMean, cpmCv);
  
  const samples = sampleJointPosteriors(N, ctrPost, cvrPost, cpmPost);
  
  const ctrSamples = samples.map(s => s.ctr);
  const cvrSamples = samples.map(s => s.cvr);
  const cpmSamples = samples.map(s => s.cpm);
  
  return {
    CTR: summarizeMetric(ctrSamples),
    CVR: summarizeMetric(cvrSamples),
    CPM: summarizeMetric(cpmSamples)
  };
}

function convertPlatformData() {
  const results = {};
  
  platformDataJson.forEach(company => {
    const { company: companyName, cpm_mean, cpm_cv, ctr_mean, ctr_std, cvr_mean, cvr_std } = company;
    
    const metrics = bayesMonteCarloMetrics(
      cpm_mean, cpm_cv,
      ctr_mean, ctr_std,
      cvr_mean, cvr_std
    );
    
    results[companyName] = metrics;
  });
  
  return results;
}

export default convertPlatformData;