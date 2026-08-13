# LLM Learning Plan — a comprehensive journey (linked edition)

Organized as a **spine** of sequenced modules, starting from Module 0 (already completed). Where a 3Blue1Brown chapter and a text cover the same ground, they're marked **≈ pick one** (▶ video when you're mobile, 📖 text when you can sit with equations). Off-spine references are preserved at the end as **standalone chapters**.

> Legend — ▶ video · 📖 text/paper · 💻 code-along · **≈ pick one** = equivalent coverage · ★ highest value given your background · **✅ DONE** = already consumed · *(K)* = Karpathy covered conceptually; you're deepening, not repeating.

---

## The spine

### Module 0 — Conceptual overview of the whole pipeline ✅ DONE
The map everything else fills in. Covers pretraining data → tokenization → inference → post-training (SFT, RLHF, RL-for-reasoning) at a conceptual, math-free level.
- ✅ ▶ Karpathy, *Deep Dive into LLMs like ChatGPT* (3h31m) — https://www.youtube.com/watch?v=7xTGNNLPyMI
- *Its coverage reappears, deepened, in Modules 3, 5, 7 — each marked* **(K)**.

### Module 1 — Representation: why vectors carry meaning
- 📖 Mikolov et al. 2013, *Efficient Estimation of Word Representations in Vector Space* (word2vec) — https://arxiv.org/abs/1301.3781

### Module 2 — The transformer architecture, in depth ★

*Overall structure + embeddings (3B1B Ch. 5):* **≈ pick one**
- ▶ 3B1B Ch. 5, *Transformers, the tech behind LLMs* — https://www.youtube.com/watch?v=wjZofJX0v4M · text version: https://www.3blue1brown.com/lessons/gpt
- 📖 SLP3 Ch. 9 (Transformers) — https://web.stanford.edu/~jurafsky/slp3/
- 📖 Alammar, *The Illustrated Transformer* — https://jalammar.github.io/illustrated-transformer/
- 📖 Prince, *Understanding Deep Learning*, Ch. 12 (free PDF) — https://udlbook.github.io/udlbook/
- 📖 *Dive into Deep Learning* (math + runnable notebooks) — https://d2l.ai/

*Attention mechanism (3B1B Ch. 6):*
- 📖 Bahdanau, Cho, Bengio 2014, *Neural Machine Translation by Jointly Learning to Align and Translate* — https://arxiv.org/abs/1409.0473 — attention's actual birthplace, three years before the transformer
- ✅ 📖 Vaswani et al. 2017, *Attention Is All You Need* — https://arxiv.org/abs/1706.03762 — the source text for everything below; the resources here supply the derivation and intuition it compresses.

**≈ pick one** of the following:
- ▶ 3B1B Ch. 6, *Attention in transformers, step-by-step* — https://www.youtube.com/watch?v=eMlx5fFNoYc · text: https://www.3blue1brown.com/lessons/attention
- 📖 ★ Phuong & Hutter 2022, *Formal Algorithms for Transformers* — https://arxiv.org/abs/2207.09238 (PDF: https://arxiv.org/pdf/2207.09238) — pseudocode-complete spec; the cleanest written mirror of the video's math
- 📖 ★ *The Annotated Transformer* (Harvard NLP) — https://nlp.seas.harvard.edu/annotated-transformer/ — your paper, as runnable PyTorch

*Building blocks the video glosses:*
- 📖 He et al. 2015, *Deep Residual Learning* (ResNet) — https://arxiv.org/abs/1512.03385
- 📖 Ba, Kiros, Hinton 2016, *Layer Normalization* — https://arxiv.org/abs/1607.06450

**Exit check:** you can write attention + a transformer block from the pseudocode unaided.

### Module 3 — From architecture to a language model
- 📖 Radford et al. 2018, *Improving Language Understanding by Generative Pre-Training* (GPT-1) — https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf
- 📖 Radford et al. 2019, *Language Models are Unsupervised Multitask Learners* (GPT-2) — https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- 📖 Brown et al. 2020, *Language Models are Few-Shot Learners* (GPT-3) — https://arxiv.org/abs/2005.14165

*How facts are stored (3B1B Ch. 7):* **≈ pick one**
- ▶ 3B1B Ch. 7, *How might LLMs store facts* — https://www.3blue1brown.com/lessons/mlp
- 📖 ★ Geva et al. 2021, *Transformer Feed-Forward Layers Are Key-Value Memories* — https://aclanthology.org/2021.emnlp-main.446/

### Module 4 — Modern architecture: what changed since 2017 ★
*No baseline resource and no 3B1B chapter covers this — biggest catch-up delta.*
- 📖 ★ Su et al. 2021, *RoFormer: Rotary Position Embedding* (RoPE) — https://arxiv.org/abs/2104.09864 · intuition primer: https://blog.eleuther.ai/rotary-embeddings/
- 📖 Zhang & Sennrich 2019, *Root Mean Square Layer Normalization* — https://arxiv.org/abs/1910.07467
- 📖 Shazeer 2020, *GLU Variants Improve Transformer* (SwiGLU) — https://arxiv.org/abs/2002.05202
- 📖 Shazeer 2019, *Fast Transformer Decoding* (Multi-Query Attention) — https://arxiv.org/abs/1911.02150
- 📖 Ainslie et al. 2023, *GQA* — https://arxiv.org/abs/2305.13245
- 📖 ★ Dao et al. 2022, *FlashAttention* — https://arxiv.org/abs/2205.14135 · follow-up *FlashAttention-2*: https://arxiv.org/abs/2307.08691

*Mixture-of-Experts — the dominant frontier architecture (Mixtral, DeepSeek, several Llama/Qwen variants):*
- 📖 Shazeer et al. 2017, *Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer* — https://arxiv.org/abs/1701.06538 — MoE's modern origin
- 📖 Fedus, Zoph, Shazeer 2021, *Switch Transformers* — https://arxiv.org/abs/2101.03961 — MoE simplified to the form frontier models actually use
- 📖 ★ DeepSeek-AI 2024, *DeepSeek-V2* (introduces **MLA**, Multi-head Latent Attention) — https://arxiv.org/abs/2405.04434 · *DeepSeek-V3* (the architecture R1 sits on): https://arxiv.org/abs/2412.19437

### Module 5 — Data & scale *(K)*
- 📖 Sennrich, Haddow, Birch 2016, *Neural Machine Translation of Rare Words with Subword Units* (BPE) — https://arxiv.org/abs/1508.07909
- 📖 Kaplan et al. 2020, *Scaling Laws for Neural Language Models* — https://arxiv.org/abs/2001.08361
- 📖 Hoffmann et al. 2022, *Training Compute-Optimal LLMs* (Chinchilla) — https://arxiv.org/abs/2203.15556
- 📖 *(optional)* SLP3 Ch. 7-8, pretraining & sampling in prose — https://web.stanford.edu/~jurafsky/slp3/

### Module 6 — Training at scale: how a run is actually executed ★
*The systems layer a future training project stands on — parallelism, memory, precision. No single-GPU tutorial covers it.*
- 📖 Shoeybi et al. 2019, *Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism* — https://arxiv.org/abs/1909.08053 — tensor parallelism's origin
- 📖 Rajbhandari et al. 2019, *ZeRO: Memory Optimizations Toward Training Trillion Parameter Models* — https://arxiv.org/abs/1910.02054 — sharded optimizer states; the ancestor of FSDP
- 📖 Micikevicius et al. 2017, *Mixed Precision Training* — https://arxiv.org/abs/1710.03740 — why loss scaling exists
- 📖 ★ Hugging Face, *The Ultra-Scale Playbook: Training LLMs on GPU Clusters* — https://huggingface.co/spaces/nanotron/ultrascale-playbook — the best available synthesis: data/tensor/pipeline parallelism, ZeRO stages, and precision in one interactive text

### Module 7 — Post-training & alignment ★ (your home turf)
- 📖 ★ Christiano et al. 2017, *Deep RL from Human Preferences* — https://arxiv.org/abs/1706.03741
- 📖 Ouyang et al. 2022, *Training LMs to Follow Instructions with Human Feedback* (InstructGPT) — https://arxiv.org/abs/2203.02155
- 📖 Rafailov et al. 2023, *Direct Preference Optimization* (DPO) — https://arxiv.org/abs/2305.18290
- 📖 ★ Shao et al. 2024, *DeepSeekMath* (introduces **GRPO**) — https://arxiv.org/abs/2402.03300
- 📖 ★ DeepSeek-AI 2025, *DeepSeek-R1* — https://arxiv.org/abs/2501.12948 · peer-reviewed version in *Nature*: https://www.nature.com/articles/s41586-025-09422-z
- 📖 *(anchor, already known)* Schulman et al. 2017, *PPO* — https://arxiv.org/abs/1707.06347

### Module 8 — Build it once
- ▶💻 Karpathy, *Let's build GPT: from scratch, in code, spelled out* (1h56m) — https://www.youtube.com/watch?v=kCc8FmEb1nY
- ▶💻 Karpathy, *Let's reproduce GPT-2 (124M)* — https://www.youtube.com/watch?v=l8pRSuU81PU
- 💻 nanoGPT repo — https://github.com/karpathy/nanoGPT
- 📖 Raschka, *Build a Large Language Model (From Scratch)* — https://www.manning.com/books/build-a-large-language-model-from-scratch · code: https://github.com/rasbt/LLMs-from-scratch

### Module 9 — Interpretability (optional)
- 📖 Meng et al. 2022, *Locating and Editing Factual Associations in GPT* (ROME) — https://arxiv.org/abs/2202.05262 · project site: https://rome.baulab.info/
- 📖 Elhage et al. 2021, *A Mathematical Framework for Transformer Circuits* — https://transformer-circuits.pub/2021/framework/index.html

---

## Standalone chapters (kept, off-spine)

- 📖 **Devlin et al. 2019, *BERT*** — https://arxiv.org/abs/1810.04805 — the encoder-only sibling; *alongside Module 3*
- 📖 **Pennington et al. 2014, *GloVe*** — https://aclanthology.org/D14-1162/ — count-based contrast to word2vec; *Module 1*
- 📖 **Lilian Weng**, *The Transformer Family v2.0* — https://lilianweng.github.io/posts/2023-01-27-the-transformer-family-v2/ · *Attention? Attention!* — https://lilianweng.github.io/posts/2018-06-24-attention/ — orientation map; good *before Module 4*
- 📖 **Bishop & Bishop 2024**, *Deep Learning: Foundations and Concepts* — https://www.bishopbook.com/ — alternative rigorous transformer chapter
- ▶ **3B1B, full Neural Networks series** (Ch. 1-4: MLPs, backprop) — https://www.3blue1brown.com/topics/neural-networks — refresher if any prerequisite feels rusty

---

## At a glance
`0 Overview ✅ → 1 Embeddings → 2 Architecture ★ (paper ✅, derivation pending) → 3 GPT + FFN-memory → 4 Modern arch ★ → 5 Data & scale → 6 Training at scale ★ → 7 Post-training ★ → 8 Build once → 9 Interpretability (opt)`

- Modules 1-3 *deepen* what you've already seen — lean on the ▶ lane if time is short.
- Modules 4, 6 and 7 are the genuinely new material — highest return.
- Module 8 is the hinge: without one build, 2-7 stay theoretical.

**Out of scope (deliberate):** the application layer — RAG, agents, inference/serving, evals. Separate track.

> All arXiv IDs and URLs above were verified against sources rather than recalled. Publisher pages (Manning, Nature) may sit behind paywalls; arXiv/ACL versions are open.
