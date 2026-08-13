# LLM Learning Plan

**Topic:** Large language models — the transformer architecture and how LLMs are trained, from pretraining to reasoning-RL.

**Goal:** Read and understand new LLM papers as they are released, and understand architecture and training deeply enough to drive a possible future training project. Deliberately out of scope: the training project itself, and the application layer (RAG, agents, inference/serving, evals) — separate track.

**Promise:** Steps are sequential — each depends only on what came before it. Walk them in order.

**How to read a Step:** *Scope* bounds it; *Done when* is its exit check. Resources are typed by lane. **Historical** is provenance — who introduced the idea, when, and where; know it exists, skim it out of curiosity, budget no study hours on it. **Video** and **Written** are the study lanes — the best treatments available. **Extra** and **Hands-on** are optional depth. When the best written treatment is the original itself, one entry carries both labels (**Historical + Written**).

Legend: ✅ = already consumed · ★ = highest value given your background · *(K)* = covered conceptually by Karpathy in Step 0 — you're deepening, not repeating.

At a glance: `0 Overview ✅ → 1 Embeddings → 2 Architecture ★ → 3 GPT → 4 Modern arch ★ → 5 Data & scale → 6 Training at scale ★ → 7 Post-training ★ → 8 Build once → 9 Interpretability (opt)`. Steps 1–3 deepen what you've already seen; Steps 4, 6 and 7 are the genuinely new material — highest return. Step 8 is the hinge: without one build, 2–7 stay theoretical.

---

## Step 0 — Conceptual overview of the whole pipeline ✅ DONE

**Scope:** the map everything else fills in — pretraining data → tokenization → inference → post-training (SFT, RLHF, RL-for-reasoning), conceptual and math-free. A survey Step: its originals live in Steps 1–7.

**Done when:** you can sketch the full pipeline and say what each stage consumes and produces.

- **Video:** ✅ Karpathy, *Deep Dive into LLMs like ChatGPT* (3h31m) — https://www.youtube.com/watch?v=7xTGNNLPyMI
- **Extra:** 3B1B, *Neural Networks* series Ch. 1-4 (MLPs, backprop) — https://www.3blue1brown.com/topics/neural-networks — refresher if any prerequisite feels rusty.

## Step 1 — Representation: why vectors carry meaning

**Scope:** distributed representations — how meaning becomes geometry; the assumption every later Step builds on.

**Done when:** you can explain why vector arithmetic (king − man + woman ≈ queen) works and what objective word2vec optimises.

- **Historical + Written:** Mikolov et al. 2013, *Efficient Estimation of Word Representations in Vector Space* (word2vec) — https://arxiv.org/abs/1301.3781 — the original is still the best short read on the idea.
- **Video:** Stanford CS224N (Manning), Lecture 1 — *Introduction and Word Vectors* — https://www.youtube.com/watch?v=rmVRLeJRkl4
- **Extra:** Pennington et al. 2014, *GloVe* — https://aclanthology.org/D14-1162/ — the count-based contrast to word2vec.

## Step 2 — The transformer architecture, in depth ★

**Scope:** the full architecture — embeddings, attention, the transformer block — to the level where the math is yours, not summarised.

**Done when:** you can write attention + a transformer block from the pseudocode unaided.

- **Historical:** Bahdanau, Cho, Bengio 2014, *Neural Machine Translation by Jointly Learning to Align and Translate* — https://arxiv.org/abs/1409.0473 — attention's actual birthplace, three years before the transformer.
- **Historical + Written:** ✅ Vaswani et al. 2017, *Attention Is All You Need* — https://arxiv.org/abs/1706.03762 — the source text; the lanes below supply the derivation and intuition it compresses.
- **Video:** 3B1B Ch. 5, *Transformers, the tech behind LLMs* — https://www.youtube.com/watch?v=wjZofJX0v4M (text: https://www.3blue1brown.com/lessons/gpt), then Ch. 6, *Attention in transformers, step-by-step* — https://www.youtube.com/watch?v=eMlx5fFNoYc (text: https://www.3blue1brown.com/lessons/attention)
- **Written (pick one):** ★ Phuong & Hutter 2022, *Formal Algorithms for Transformers* — https://arxiv.org/abs/2207.09238 (PDF: https://arxiv.org/pdf/2207.09238) — pseudocode-complete spec, the cleanest written mirror of the video's math · or ★ *The Annotated Transformer* (Harvard NLP) — https://nlp.seas.harvard.edu/annotated-transformer/ — your paper, as runnable PyTorch.
- **Written (equivalent alternatives for the overall structure — pick by taste):** SLP3 Ch. 9 (Transformers) — https://web.stanford.edu/~jurafsky/slp3/ · Alammar, *The Illustrated Transformer* — https://jalammar.github.io/illustrated-transformer/ · Prince, *Understanding Deep Learning* Ch. 12 (free PDF) — https://udlbook.github.io/udlbook/ · *Dive into Deep Learning* (math + runnable notebooks) — https://d2l.ai/ · Bishop & Bishop 2024, *Deep Learning: Foundations and Concepts* — https://www.bishopbook.com/
- **Extra (building blocks the derivations gloss):** He et al. 2015, *Deep Residual Learning* (ResNet) — https://arxiv.org/abs/1512.03385 · Ba, Kiros, Hinton 2016, *Layer Normalization* — https://arxiv.org/abs/1607.06450

## Step 3 — From architecture to a language model *(K)*

**Scope:** decoder-only pretraining at scale — GPT-1 to GPT-3 — and where the learned knowledge physically lives in the network.

**Done when:** you can state what changed from GPT-1 to GPT-2 to GPT-3 (objective, scale, zero/few-shot behaviour) and explain how feed-forward layers act as key-value memories.

- **Historical + Written:** Radford et al. 2018, *Improving Language Understanding by Generative Pre-Training* (GPT-1) — https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf
- **Historical + Written:** Radford et al. 2019, *Language Models are Unsupervised Multitask Learners* (GPT-2) — https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- **Historical + Written:** Brown et al. 2020, *Language Models are Few-Shot Learners* (GPT-3) — https://arxiv.org/abs/2005.14165
- **Video:** 3B1B Ch. 7, *How might LLMs store facts* — https://www.3blue1brown.com/lessons/mlp
- **Written:** ★ Geva et al. 2021, *Transformer Feed-Forward Layers Are Key-Value Memories* — https://aclanthology.org/2021.emnlp-main.446/
- **Extra:** Devlin et al. 2019, *BERT* — https://arxiv.org/abs/1810.04805 — the encoder-only sibling.

## Step 4 — Modern architecture: what changed since 2017 ★

**Scope:** the component deltas between Vaswani 2017 and a current frontier model — positions, norms, activations, attention variants, kernels, sparsity. The biggest catch-up delta: no baseline resource covers this.

**Done when:** you can read a current model card (Llama, Qwen, DeepSeek) and recognise every architecture term — RoPE, RMSNorm, SwiGLU, MQA/GQA/MLA, MoE, FlashAttention — and say why each replaced its 2017 counterpart.

- **Video:** Umar Jamil, *LLaMA explained: KV-Cache, Rotary Positional Embedding, RMS Norm, Grouped Query Attention, SwiGLU* — https://www.youtube.com/watch?v=Mn_9W1nCFLo — one pass over most of this Step's components, math included.
- **Historical + Written:** ★ Su et al. 2021, *RoFormer: Rotary Position Embedding* (RoPE) — https://arxiv.org/abs/2104.09864 · intuition primer: https://blog.eleuther.ai/rotary-embeddings/
- **Historical + Written:** Zhang & Sennrich 2019, *Root Mean Square Layer Normalization* — https://arxiv.org/abs/1910.07467
- **Historical + Written:** Shazeer 2020, *GLU Variants Improve Transformer* (SwiGLU) — https://arxiv.org/abs/2002.05202
- **Historical + Written:** Shazeer 2019, *Fast Transformer Decoding* (Multi-Query Attention) — https://arxiv.org/abs/1911.02150 · Ainslie et al. 2023, *GQA* — https://arxiv.org/abs/2305.13245
- **Historical + Written:** ★ Dao et al. 2022, *FlashAttention* — https://arxiv.org/abs/2205.14135 · follow-up *FlashAttention-2* — https://arxiv.org/abs/2307.08691
- **Historical (MoE):** Shazeer et al. 2017, *Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer* — https://arxiv.org/abs/1701.06538 — MoE's modern origin.
- **Written (MoE):** Fedus, Zoph, Shazeer 2021, *Switch Transformers* — https://arxiv.org/abs/2101.03961 — MoE simplified to the form frontier models actually use.
- **Historical + Written (MLA):** ★ DeepSeek-AI 2024, *DeepSeek-V2* (introduces Multi-head Latent Attention) — https://arxiv.org/abs/2405.04434 · *DeepSeek-V3* (the architecture R1 sits on) — https://arxiv.org/abs/2412.19437
- **Extra (orientation map):** Lilian Weng, *The Transformer Family v2.0* — https://lilianweng.github.io/posts/2023-01-27-the-transformer-family-v2/ · *Attention? Attention!* — https://lilianweng.github.io/posts/2018-06-24-attention/

## Step 5 — Data & scale *(K)*

**Scope:** what the model is trained on and how big to make it — tokenization, scaling laws, compute-optimal sizing.

**Done when:** given a compute budget you can sketch the Chinchilla-optimal model/data split, and explain what BPE does to a rare word.

- **Historical + Written:** Sennrich, Haddow, Birch 2016, *Neural Machine Translation of Rare Words with Subword Units* (BPE) — https://arxiv.org/abs/1508.07909
- **Historical + Written:** Kaplan et al. 2020, *Scaling Laws for Neural Language Models* — https://arxiv.org/abs/2001.08361 · Hoffmann et al. 2022, *Training Compute-Optimal LLMs* (Chinchilla) — https://arxiv.org/abs/2203.15556 — read as a pair: the second corrects the first.
- **Extra:** SLP3 Ch. 7-8, pretraining & sampling in prose — https://web.stanford.edu/~jurafsky/slp3/

*(No video lane: nothing community-standard exists; Step 0 already covers this ground conceptually.)*

## Step 6 — Training at scale: how a run is actually executed ★

**Scope:** the systems layer a future training project stands on — parallelism, memory, precision. No single-GPU tutorial covers it.

**Done when:** you can lay out a multi-GPU run — what is sharded along which axis (data/tensor/pipeline parallelism, ZeRO stages) — and say where mixed precision bites.

- **Historical:** Shoeybi et al. 2019, *Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism* — https://arxiv.org/abs/1909.08053 — tensor parallelism's origin.
- **Historical:** Rajbhandari et al. 2019, *ZeRO: Memory Optimizations Toward Training Trillion Parameter Models* — https://arxiv.org/abs/1910.02054 — sharded optimizer states; the ancestor of FSDP.
- **Historical:** Micikevicius et al. 2017, *Mixed Precision Training* — https://arxiv.org/abs/1710.03740 — why loss scaling exists.
- **Written:** ★ Hugging Face, *The Ultra-Scale Playbook: Training LLMs on GPU Clusters* — https://huggingface.co/spaces/nanotron/ultrascale-playbook — the study lane for this whole Step: data/tensor/pipeline parallelism, ZeRO stages and precision in one interactive text.

*(No video lane: the playbook is interactive and beats every video treatment available.)*

## Step 7 — Post-training & alignment ★ (your home turf) *(K)*

**Scope:** from base model to assistant to reasoner — SFT, RLHF, DPO, GRPO and the R1 recipe.

**Done when:** you can trace InstructGPT's three stages, explain how DPO removes the reward model, and state what GRPO changes relative to PPO and what R1 showed about RL without supervised reasoning traces.

- **Historical:** ★ Christiano et al. 2017, *Deep RL from Human Preferences* — https://arxiv.org/abs/1706.03741 — RLHF's origin.
- **Written:** Ouyang et al. 2022, *Training LMs to Follow Instructions with Human Feedback* (InstructGPT) — https://arxiv.org/abs/2203.02155 — the recipe every assistant descends from.
- **Video:** Umar Jamil, *Direct Preference Optimization (DPO) explained* — https://www.youtube.com/watch?v=hvGa5Mba4c8 — Bradley-Terry model and the loss, derived step by step.
- **Written:** Rafailov et al. 2023, *Direct Preference Optimization* (DPO) — https://arxiv.org/abs/2305.18290
- **Written:** ★ Shao et al. 2024, *DeepSeekMath* (introduces GRPO) — https://arxiv.org/abs/2402.03300
- **Written:** ★ DeepSeek-AI 2025, *DeepSeek-R1* — https://arxiv.org/abs/2501.12948 · peer-reviewed version in Nature: https://www.nature.com/articles/s41586-025-09422-z
- **Extra (anchor, already known):** Schulman et al. 2017, *PPO* — https://arxiv.org/abs/1707.06347

## Step 8 — Build it once

**Scope:** praxis — turn Steps 2–5 into working code. No new originals: this Step's theory lives in Steps 2–3.

**Done when:** your from-scratch GPT trains with a loss curve you can explain, and you have reproduced GPT-2 (124M) or know precisely which resource stops you.

- **Video + Hands-on:** Karpathy, *Let's build GPT: from scratch, in code, spelled out* (1h56m) — https://www.youtube.com/watch?v=kCc8FmEb1nY · then *Let's reproduce GPT-2 (124M)* — https://www.youtube.com/watch?v=l8pRSuU81PU
- **Hands-on:** nanoGPT repo — https://github.com/karpathy/nanoGPT
- **Written:** Raschka, *Build a Large Language Model (From Scratch)* — https://www.manning.com/books/build-a-large-language-model-from-scratch · code: https://github.com/rasbt/LLMs-from-scratch

## Step 9 — Interpretability (optional)

**Scope:** how to look inside the model. In Goal scope only insofar as new papers increasingly assume this vocabulary — skip until a paper forces it.

**Done when:** you can explain what a circuit is and how ROME locates and edits a stored fact.

- **Historical + Written:** Elhage et al. 2021, *A Mathematical Framework for Transformer Circuits* — https://transformer-circuits.pub/2021/framework/index.html — the framework's origin.
- **Written:** Meng et al. 2022, *Locating and Editing Factual Associations in GPT* (ROME) — https://arxiv.org/abs/2202.05262 · project site: https://rome.baulab.info/

---

> All URLs above were verified against sources rather than recalled — including the video lanes added in this revision. Publisher pages (Manning, Nature) may sit behind paywalls; arXiv/ACL versions are open.
