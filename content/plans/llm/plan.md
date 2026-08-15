# LLM Learning Plan

**Topic:** Large language models — the transformer architecture and how LLMs are trained, from pretraining to reasoning-RL.

**Goal:** Read and understand new LLM papers as they are released, and understand architecture and training deeply enough to drive a possible future training project. Deliberately out of scope: the training project itself, and the application layer (RAG, agents, inference/serving, evals) — separate track.

**Promise:** Steps are sequential — each depends only on what came before it. Walk them in order. Parts group Steps thematically; the Step numbering runs through them.

**How to read a Step:** each Step is atomic — one concept, at most one resource per lane. **Historical** is mandatory and is provenance: who introduced the idea, when, and where; skim it out of curiosity, budget no study hours on it. **Video** and **Written** are the study lanes, present only when a worthy one exists — a Step with neither is a Historical-only Step: the skim is the whole visit. When the best written treatment is the original itself, one entry carries both labels (**Historical + Written**). **Extra** and **Hands-on** lines are optional depth outside the lanes.

Legend: ✅ = already consumed · ★ = highest value given your background · *(K)* = covered conceptually by Karpathy in the Preamble — you're deepening, not repeating.

At a glance: `I Representation → II Transformer ★ → III GPT → IV Modern architecture ★ → V Data & scale → VI Training at scale ★ → VII Post-training ★ → VIII Build it once → IX Interpretability (opt)`. Parts I–III deepen what you've already seen; IV, VI and VII are the genuinely new material — highest return. Part VIII is the hinge: without one build, everything before it stays theoretical.

---

## Preamble — the map, already walked ✅

A survey with no original of its own — the originals live in the Steps below. It covered pretraining data → tokenization → inference → post-training (SFT, RLHF, RL-for-reasoning), conceptual and math-free.

- **Video:** ✅ Karpathy, *Deep Dive into LLMs like ChatGPT* (3h31m) — https://www.youtube.com/watch?v=7xTGNNLPyMI
- **Extra:** 3B1B, *Neural Networks* series Ch. 1-4 (MLPs, backprop) — https://www.3blue1brown.com/topics/neural-networks — refresher if any prerequisite feels rusty.

## Part I — Representation: why vectors carry meaning

### Step 1 — Word embeddings

**Done when:** you can explain why vector arithmetic (king − man + woman ≈ queen) works and what objective word2vec optimises.

- **Historical + Written:** Mikolov et al. 2013, *Efficient Estimation of Word Representations in Vector Space* (word2vec) — https://arxiv.org/abs/1301.3781 — the original is still the best short read on the idea.
- **Video:** Stanford CS224N (Manning), Lecture 1 — *Introduction and Word Vectors* — https://www.youtube.com/watch?v=rmVRLeJRkl4
- **Extra:** Pennington et al. 2014, *GloVe* — https://aclanthology.org/D14-1162/ — the count-based contrast to word2vec.

## Part II — The transformer ★

The full architecture — attention, then the block around it — to the level where the math is yours, not summarised.

### Step 2 — Attention is born

**Done when:** you can say what problem alignment solved in 2014 neural machine translation and how additive attention scores the source positions.

- **Historical:** Bahdanau, Cho, Bengio 2014, *Neural Machine Translation by Jointly Learning to Align and Translate* — https://arxiv.org/abs/1409.0473 — attention's actual birthplace, three years before the transformer. A Historical-only Step: the skim is the visit.

### Step 3 — The transformer, in depth

**Done when:** you can write attention + a transformer block from the pseudocode unaided.

- **Historical:** ✅ Vaswani et al. 2017, *Attention Is All You Need* — https://arxiv.org/abs/1706.03762 — the source text; it compresses the derivation the study lanes unfold.
- **Video:** 3B1B Ch. 5, *Transformers, the tech behind LLMs* — https://www.youtube.com/watch?v=wjZofJX0v4M (text: https://www.3blue1brown.com/lessons/gpt), then Ch. 6, *Attention in transformers, step-by-step* — https://www.youtube.com/watch?v=eMlx5fFNoYc (text: https://www.3blue1brown.com/lessons/attention)
- **Written:** ★ Phuong & Hutter 2022, *Formal Algorithms for Transformers* — https://arxiv.org/abs/2207.09238 (PDF: https://arxiv.org/pdf/2207.09238) — pseudocode-complete spec, the cleanest written mirror of the video's math.
- **Hands-on:** *The Annotated Transformer* (Harvard NLP) — https://nlp.seas.harvard.edu/annotated-transformer/ — your paper, as runnable PyTorch.
- **Extra (equivalent treatments, if the Written doesn't land):** SLP3 Ch. 9 (Transformers) — https://web.stanford.edu/~jurafsky/slp3/ · Alammar, *The Illustrated Transformer* — https://jalammar.github.io/illustrated-transformer/ · Prince, *Understanding Deep Learning* Ch. 12 (free PDF) — https://udlbook.github.io/udlbook/ · *Dive into Deep Learning* (math + runnable notebooks) — https://d2l.ai/ · Bishop & Bishop 2024, *Deep Learning: Foundations and Concepts* — https://www.bishopbook.com/
- **Extra (building blocks the derivations gloss):** He et al. 2015, *Deep Residual Learning* (ResNet) — https://arxiv.org/abs/1512.03385 · Ba, Kiros, Hinton 2016, *Layer Normalization* — https://arxiv.org/abs/1607.06450

## Part III — From architecture to a language model *(K)*

Decoder-only pretraining at scale — three claims in three papers — and where the learned knowledge physically lives.

### Step 4 — Generative pretraining

**Done when:** you can state GPT-1's claim: one pretrained decoder, fine-tuned, beats task-specific architectures.

- **Historical + Written:** Radford et al. 2018, *Improving Language Understanding by Generative Pre-Training* (GPT-1) — https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf
- **Extra:** Devlin et al. 2019, *BERT* — https://arxiv.org/abs/1810.04805 — the encoder-only sibling and contemporary contrast.

### Step 5 — Language models are multitask learners

**Done when:** you can explain GPT-2's zero-shot result and why it reframed "task" as "prompt".

- **Historical + Written:** Radford et al. 2019, *Language Models are Unsupervised Multitask Learners* (GPT-2) — https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf

### Step 6 — In-context learning

**Done when:** you can explain few-shot prompting as GPT-3 demonstrated it and why scale changed the interface, not just the scores.

- **Historical + Written:** Brown et al. 2020, *Language Models are Few-Shot Learners* (GPT-3) — https://arxiv.org/abs/2005.14165

### Step 7 — Where facts live

**Done when:** you can explain how feed-forward layers act as key-value memories.

- **Historical + Written:** ★ Geva et al. 2021, *Transformer Feed-Forward Layers Are Key-Value Memories* — https://aclanthology.org/2021.emnlp-main.446/ — where the FFN-as-memory claim was made.
- **Video:** 3B1B Ch. 7, *How might LLMs store facts* — https://www.3blue1brown.com/lessons/mlp

## Part IV — Modern architecture: what changed since 2017 ★

The component deltas between Vaswani 2017 and a current frontier model. The biggest catch-up delta: no baseline resource covers this. Exit bar for the whole Part: read a current model card (Llama, Qwen, DeepSeek) and recognise every term.

### Step 8 — Rotary position embeddings

**Done when:** you can explain why rotating query/key pairs encodes relative position.

- **Historical:** ★ Su et al. 2021, *RoFormer: Rotary Position Embedding* (RoPE) — https://arxiv.org/abs/2104.09864
- **Video:** Umar Jamil, *LLaMA explained: KV-Cache, Rotary Positional Embedding, RMS Norm, Grouped Query Attention, SwiGLU* — https://www.youtube.com/watch?v=Mn_9W1nCFLo — one pass over Steps 8–11 plus the KV-cache; watch it once here.
- **Written:** EleutherAI, *Rotary Embeddings: A Relative Revolution* — https://blog.eleuther.ai/rotary-embeddings/ — the intuition the paper compresses.
- **Extra (orientation map for this whole Part):** Lilian Weng, *The Transformer Family v2.0* — https://lilianweng.github.io/posts/2023-01-27-the-transformer-family-v2/ · *Attention? Attention!* — https://lilianweng.github.io/posts/2018-06-24-attention/

### Step 9 — RMSNorm

**Done when:** you can say what RMSNorm drops relative to LayerNorm and why that's enough.

- **Historical + Written:** Zhang & Sennrich 2019, *Root Mean Square Layer Normalization* — https://arxiv.org/abs/1910.07467

### Step 10 — Gated feed-forward: SwiGLU

**Done when:** you can write the SwiGLU block and say what the gate buys.

- **Historical + Written:** Shazeer 2020, *GLU Variants Improve Transformer* (SwiGLU) — https://arxiv.org/abs/2002.05202

### Step 11 — Shrinking the KV cache: MQA → GQA

**Done when:** you can do the KV-cache arithmetic for MHA vs MQA vs GQA and state the quality trade each makes.

- **Historical:** Shazeer 2019, *Fast Transformer Decoding* (Multi-Query Attention) — https://arxiv.org/abs/1911.02150 — where sharing KV heads was proposed.
- **Written:** Ainslie et al. 2023, *GQA: Training Generalized Multi-Query Transformer Models* — https://arxiv.org/abs/2305.13245 — generalises MQA to the form frontier models use.

### Step 12 — FlashAttention

**Done when:** you can explain why IO-awareness, not FLOP reduction, is the speedup — and what stays mathematically exact.

- **Historical + Written:** ★ Dao et al. 2022, *FlashAttention* — https://arxiv.org/abs/2205.14135
- **Extra:** *FlashAttention-2* — https://arxiv.org/abs/2307.08691 — the engineering follow-up.

### Step 13 — Mixture-of-Experts

**Done when:** you can explain routing and load-balancing, and why MoE scales parameters without scaling per-token FLOPs.

- **Historical:** Shazeer et al. 2017, *Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer* — https://arxiv.org/abs/1701.06538 — MoE's modern origin.
- **Written:** Fedus, Zoph, Shazeer 2021, *Switch Transformers* — https://arxiv.org/abs/2101.03961 — MoE simplified to the form frontier models actually use.

### Step 14 — Multi-head Latent Attention

**Done when:** you can explain how latent KV compression differs from MQA/GQA and what it costs.

- **Historical + Written:** ★ DeepSeek-AI 2024, *DeepSeek-V2* (introduces MLA) — https://arxiv.org/abs/2405.04434
- **Extra:** *DeepSeek-V3* — https://arxiv.org/abs/2412.19437 — the architecture R1 sits on.

## Part V — Data & scale *(K)*

What the model is trained on and how big to make it.

### Step 15 — Tokenization: BPE

**Done when:** you can trace what BPE does to a rare word.

- **Historical + Written:** Sennrich, Haddow, Birch 2016, *Neural Machine Translation of Rare Words with Subword Units* (BPE) — https://arxiv.org/abs/1508.07909
- **Extra:** SLP3 Ch. 7-8, pretraining & sampling in prose — https://web.stanford.edu/~jurafsky/slp3/

### Step 16 — Scaling laws

**Done when:** you can state which quantities relate by power laws and what that predicts.

- **Historical + Written:** Kaplan et al. 2020, *Scaling Laws for Neural Language Models* — https://arxiv.org/abs/2001.08361

### Step 17 — Compute-optimal training

**Done when:** given a compute budget you can sketch the Chinchilla-optimal model/data split — and say where Kaplan went wrong.

- **Historical + Written:** Hoffmann et al. 2022, *Training Compute-Optimal LLMs* (Chinchilla) — https://arxiv.org/abs/2203.15556 — corrects Step 16's constant.

## Part VI — Training at scale: how a run is actually executed ★

The systems layer a future training project stands on — parallelism, memory, precision. The Written of Step 18 is the study text for the whole Part.

### Step 18 — Tensor parallelism

**Done when:** you can say what is sharded along which axis in data vs tensor vs pipeline parallelism.

- **Historical:** Shoeybi et al. 2019, *Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism* — https://arxiv.org/abs/1909.08053 — tensor parallelism's origin.
- **Written:** ★ Hugging Face, *The Ultra-Scale Playbook: Training LLMs on GPU Clusters* — https://huggingface.co/spaces/nanotron/ultrascale-playbook — covers Steps 18–20 in one interactive text; no video beats it.

### Step 19 — ZeRO

**Done when:** you can name ZeRO's three stages and what each one shards.

- **Historical:** Rajbhandari et al. 2019, *ZeRO: Memory Optimizations Toward Training Trillion Parameter Models* — https://arxiv.org/abs/1910.02054 — sharded optimizer states; the ancestor of FSDP.

### Step 20 — Mixed precision

**Done when:** you can explain why loss scaling exists and where fp16/bf16 bite differently.

- **Historical:** Micikevicius et al. 2017, *Mixed Precision Training* — https://arxiv.org/abs/1710.03740

## Part VII — Post-training & alignment ★ (your home turf) *(K)*

From base model to assistant to reasoner.

### Step 21 — RL from human preferences

**Done when:** you can trace the loop: preferences → reward model → policy optimisation.

- **Historical + Written:** ★ Christiano et al. 2017, *Deep RL from Human Preferences* — https://arxiv.org/abs/1706.03741 — RLHF's origin.

### Step 22 — The InstructGPT recipe

**Done when:** you can trace InstructGPT's three stages and say what each contributes.

- **Historical + Written:** Ouyang et al. 2022, *Training LMs to Follow Instructions with Human Feedback* (InstructGPT) — https://arxiv.org/abs/2203.02155 — the recipe every assistant descends from.

### Step 23 — Direct Preference Optimization

**Done when:** you can explain how DPO removes the reward model and derive the sign of its gradient.

- **Historical + Written:** Rafailov et al. 2023, *Direct Preference Optimization* (DPO) — https://arxiv.org/abs/2305.18290
- **Video:** Umar Jamil, *Direct Preference Optimization (DPO) explained* — https://www.youtube.com/watch?v=hvGa5Mba4c8 — Bradley-Terry model and the loss, derived step by step.

### Step 24 — GRPO

**Done when:** you can state what GRPO changes relative to PPO and why that suits LLM reward landscapes.

- **Historical + Written:** ★ Shao et al. 2024, *DeepSeekMath* (introduces GRPO) — https://arxiv.org/abs/2402.03300
- **Extra (anchor, already known):** Schulman et al. 2017, *PPO* — https://arxiv.org/abs/1707.06347

### Step 25 — R1: reasoning from RL alone

**Done when:** you can state what R1 showed about RL without supervised reasoning traces, and what R1-Zero's failure modes were.

- **Historical + Written:** ★ DeepSeek-AI 2025, *DeepSeek-R1* — https://arxiv.org/abs/2501.12948 · peer-reviewed version in Nature: https://www.nature.com/articles/s41586-025-09422-z

## Part VIII — Build it once · hands-on track

Praxis, not a lane-bearing Step: no new originals — the theory lives in Parts II–VI. Done when your from-scratch GPT trains with a loss curve you can explain, and you have reproduced GPT-2 (124M) or know precisely which resource stops you.

- **Hands-on:** Karpathy, *Let's build GPT: from scratch, in code, spelled out* (1h56m) — https://www.youtube.com/watch?v=kCc8FmEb1nY · then *Let's reproduce GPT-2 (124M)* — https://www.youtube.com/watch?v=l8pRSuU81PU
- **Hands-on:** nanoGPT repo — https://github.com/karpathy/nanoGPT
- **Extra:** Raschka, *Build a Large Language Model (From Scratch)* — https://www.manning.com/books/build-a-large-language-model-from-scratch · code: https://github.com/rasbt/LLMs-from-scratch

## Part IX — Interpretability (optional)

In Goal scope only insofar as new papers increasingly assume this vocabulary — skip until a paper forces it.

### Step 26 — Circuits

**Done when:** you can explain what a circuit is and what an induction head does.

- **Historical + Written:** Elhage et al. 2021, *A Mathematical Framework for Transformer Circuits* — https://transformer-circuits.pub/2021/framework/index.html — the framework's origin.

### Step 27 — Locating facts: ROME

**Done when:** you can explain how ROME locates and edits a stored fact.

- **Historical + Written:** Meng et al. 2022, *Locating and Editing Factual Associations in GPT* (ROME) — https://arxiv.org/abs/2202.05262 · project site: https://rome.baulab.info/

---

> All URLs above were verified against sources rather than recalled. Publisher pages (Manning, Nature) may sit behind paywalls; arXiv/ACL versions are open.
