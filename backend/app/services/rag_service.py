"""
RAG Service — Retrieval-Augmented Generation for PulseIQ.

How it works:
1. On startup, we load a medical knowledge base into ChromaDB (vector store).
2. When a user asks a question, we convert it to a vector and search for
   the most relevant knowledge chunks.
3. Those chunks are injected into the AI prompt as verified context.
4. The AI answers based on that context, not just general training.
"""

import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import Optional

# ── Constants ─────────────────────────────────────────────────────────────────
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")
COLLECTION_NAME = "medical_knowledge"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # Small, fast, good quality — 90MB download
TOP_K = 4  # How many knowledge chunks to retrieve per query

# ── Singleton instances (loaded once, reused) ─────────────────────────────────
_chroma_client: Optional[chromadb.PersistentClient] = None
_collection = None
_embedder: Optional[SentenceTransformer] = None


def _get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        print("[RAG] Loading embedding model (first run may take a moment)...")
        _embedder = SentenceTransformer(EMBEDDING_MODEL)
        print("[RAG] Embedding model ready.")
    return _embedder


def _get_collection():
    global _chroma_client, _collection
    if _collection is None:
        os.makedirs(CHROMA_PATH, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(
            path=CHROMA_PATH,
            settings=Settings(anonymized_telemetry=False),
        )
        _collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"heuristic": "cosine"},
        )
        # Seed the knowledge base if empty
        if _collection.count() == 0:
            print("[RAG] Knowledge base empty — seeding with medical data...")
            _seed_knowledge_base()
            print(f"[RAG] Knowledge base seeded with {_collection.count()} chunks.")
        else:
            print(f"[RAG] Knowledge base loaded — {_collection.count()} chunks ready.")
    return _collection


def _seed_knowledge_base():
    """
    Load our verified medical knowledge into the vector store.
    Each entry has: id, text (the knowledge), metadata (category, source).
    In production this would load from medical textbooks / verified sources.
    For now we seed with high-quality general medical knowledge.
    """
    collection = _collection
    embedder = _get_embedder()

    knowledge_chunks = [
        # ── Emergency symptoms ────────────────────────────────────────────────
        {
            "id": "emergency_001",
            "text": "Chest pain can indicate a heart attack, especially when accompanied by pain radiating to the left arm, jaw, or back, shortness of breath, sweating, and nausea. This is a medical emergency requiring immediate 911 call. Time is critical — every minute of delay increases heart muscle damage.",
            "category": "emergency", "source": "AHA Guidelines"
        },
        {
            "id": "emergency_002",
            "text": "Stroke warning signs include sudden numbness or weakness in the face, arm, or leg (especially on one side), sudden confusion or trouble speaking, sudden vision problems, sudden severe headache with no known cause, and sudden dizziness. Use the FAST test: Face drooping, Arm weakness, Speech difficulty, Time to call 911.",
            "category": "emergency", "source": "American Stroke Association"
        },
        {
            "id": "emergency_003",
            "text": "Anaphylaxis is a severe allergic reaction that can be life-threatening. Symptoms include throat swelling, difficulty breathing, hives, drop in blood pressure, and loss of consciousness. Epinephrine (EpiPen) should be administered immediately and emergency services called.",
            "category": "emergency", "source": "AAAAI Guidelines"
        },
        # ── Common symptoms ───────────────────────────────────────────────────
        {
            "id": "symptoms_001",
            "text": "Fever is a body temperature above 38°C (100.4°F). Low-grade fever (38-38.9°C) is often caused by viral infections, vaccinations, or minor bacterial infections. High fever above 39.4°C needs medical attention. In adults, fever with stiff neck, severe headache, or confusion warrants immediate care due to risk of meningitis.",
            "category": "symptoms", "source": "Mayo Clinic"
        },
        {
            "id": "symptoms_002",
            "text": "Headaches are classified as tension headaches (tight band around head, most common), migraines (throbbing pain, often one-sided, with light/sound sensitivity, nausea), and cluster headaches (severe pain around one eye). Red flags requiring immediate care: sudden worst headache of life, headache with fever and stiff neck, headache after head injury.",
            "category": "symptoms", "source": "WHO Guidelines"
        },
        {
            "id": "symptoms_003",
            "text": "Shortness of breath (dyspnea) can have many causes. Acute onset may indicate asthma attack, pulmonary embolism, pneumothorax, or heart failure. Chronic causes include COPD, asthma, anaemia, and heart disease. Sudden severe breathlessness, especially with chest pain or blue lips, requires emergency care.",
            "category": "symptoms", "source": "BTS Guidelines"
        },
        {
            "id": "symptoms_004",
            "text": "Persistent cough lasting more than 3 weeks should be evaluated. Common causes include post-nasal drip, GERD, asthma, and ACE inhibitor medications. Cough with blood, weight loss, night sweats, or lasting more than 3 weeks needs medical evaluation to rule out tuberculosis or lung cancer.",
            "category": "symptoms", "source": "CHEST Guidelines"
        },
        {
            "id": "symptoms_005",
            "text": "Abdominal pain location helps identify the cause. Right upper quadrant: gallbladder or liver issues. Right lower quadrant: appendicitis (especially with fever and rebound tenderness). Left lower quadrant: diverticulitis or constipation. Central: gastritis, peptic ulcer, or bowel obstruction. Sudden severe abdominal pain is a medical emergency.",
            "category": "symptoms", "source": "NICE Guidelines"
        },
        {
            "id": "symptoms_006",
            "text": "Dizziness and vertigo differ importantly. Vertigo is the sensation that you or the room is spinning, often caused by inner ear problems (BPPV, labyrinthitis, Ménière's disease). Dizziness without spinning may be from low blood pressure, dehydration, anaemia, or medications. Sudden vertigo with double vision or difficulty walking suggests stroke.",
            "category": "symptoms", "source": "Neurology Guidelines"
        },
        # ── Common medications ────────────────────────────────────────────────
        {
            "id": "medication_001",
            "text": "Paracetamol (acetaminophen) is used for pain and fever. Maximum adult dose is 4g (4000mg) per day. Overdose causes severe liver damage — do not exceed recommended doses. Avoid combining with alcohol. Safe during pregnancy when used as directed. Does not cause stomach irritation unlike NSAIDs.",
            "category": "medications", "source": "BNF Guidelines"
        },
        {
            "id": "medication_002",
            "text": "Ibuprofen is an NSAID used for pain, fever, and inflammation. Take with food to reduce stomach irritation. Avoid in kidney disease, peptic ulcers, and late pregnancy. Can increase blood pressure and affect heart health with long-term use. Maximum adult dose is typically 1200mg per day for self-medication.",
            "category": "medications", "source": "BNF Guidelines"
        },
        {
            "id": "medication_003",
            "text": "Antibiotics should only be taken when prescribed for bacterial infections. They do not work against viral infections like colds or flu. Complete the full course even if feeling better — stopping early can cause antibiotic resistance. Common side effects include diarrhoea and yeast infections.",
            "category": "medications", "source": "WHO AMR Guidelines"
        },
        {
            "id": "medication_004",
            "text": "Metformin is the first-line medication for type 2 diabetes. It lowers blood sugar by reducing glucose production in the liver. Side effects include nausea, diarrhoea, and stomach upset — taking with food helps. Rarely causes lactic acidosis. Should be paused before contrast dye procedures.",
            "category": "medications", "source": "ADA Guidelines"
        },
        {
            "id": "medication_005",
            "text": "Statins (atorvastatin, rosuvastatin) lower LDL cholesterol and reduce cardiovascular risk. Common side effects include muscle aches. Rarely causes serious muscle breakdown (rhabdomyolysis) — report severe muscle pain immediately. Grapefruit juice can interact with some statins. Take at the same time each day.",
            "category": "medications", "source": "ACC/AHA Guidelines"
        },
        # ── Lab values and blood tests ─────────────────────────────────────────
        {
            "id": "labs_001",
            "text": "Complete Blood Count (CBC) measures red blood cells (RBC), white blood cells (WBC), haemoglobin, haematocrit, and platelets. Low haemoglobin indicates anaemia. High WBC suggests infection or inflammation. Low platelets (thrombocytopenia) can cause bleeding. Normal adult haemoglobin: men 13.5-17.5 g/dL, women 12-15.5 g/dL.",
            "category": "lab_values", "source": "LabTests Online"
        },
        {
            "id": "labs_002",
            "text": "HbA1c measures average blood sugar over 2-3 months. Normal: below 5.7%. Prediabetes: 5.7-6.4%. Diabetes: 6.5% or above. Target for most people with diabetes: below 7%. High HbA1c means poor blood sugar control and increased risk of complications like kidney disease, nerve damage, and eye problems.",
            "category": "lab_values", "source": "ADA Guidelines"
        },
        {
            "id": "labs_003",
            "text": "Lipid panel measures cholesterol levels. Total cholesterol: desirable below 200 mg/dL. LDL (bad cholesterol): optimal below 100 mg/dL, borderline high 130-159 mg/dL. HDL (good cholesterol): above 60 mg/dL is protective. Triglycerides: normal below 150 mg/dL. High LDL and triglycerides increase cardiovascular risk.",
            "category": "lab_values", "source": "ACC/AHA Guidelines"
        },
        {
            "id": "labs_004",
            "text": "Thyroid function tests include TSH, T3, and T4. High TSH with low T4 indicates hypothyroidism (underactive thyroid) — symptoms include fatigue, weight gain, cold sensitivity. Low TSH with high T4 indicates hyperthyroidism (overactive thyroid) — symptoms include weight loss, rapid heart rate, anxiety. TSH is the best screening test.",
            "category": "lab_values", "source": "ATA Guidelines"
        },
        {
            "id": "labs_005",
            "text": "Kidney function is assessed by creatinine, BUN (blood urea nitrogen), and eGFR. eGFR above 90 is normal. eGFR 60-89 is mildly reduced. eGFR below 60 for 3 months indicates chronic kidney disease. High creatinine suggests kidneys are not filtering well. Drink plenty of water, avoid NSAIDs long-term, and control blood pressure to protect kidneys.",
            "category": "lab_values", "source": "KDIGO Guidelines"
        },
        # ── Chronic conditions ────────────────────────────────────────────────
        {
            "id": "chronic_001",
            "text": "Type 2 diabetes management involves blood sugar monitoring, HbA1c checks every 3 months, healthy diet (low refined carbohydrates, high fibre), regular exercise (150 minutes per week), and medications. Complications include eye disease (retinopathy), kidney disease (nephropathy), nerve damage (neuropathy), and cardiovascular disease. Annual eye and foot exams are essential.",
            "category": "chronic_conditions", "source": "ADA Standards of Care"
        },
        {
            "id": "chronic_002",
            "text": "Hypertension (high blood pressure) is defined as consistently above 130/80 mmHg. Often has no symptoms. Risk factors include obesity, high salt diet, smoking, alcohol, and family history. Lifestyle changes: reduce salt, exercise, lose weight, limit alcohol. Untreated hypertension causes stroke, heart attack, kidney failure, and vision loss.",
            "category": "chronic_conditions", "source": "ACC/AHA Guidelines"
        },
        {
            "id": "chronic_003",
            "text": "Asthma is a chronic airway condition causing episodes of wheezing, shortness of breath, chest tightness, and cough. Triggers include allergens, exercise, cold air, respiratory infections, and smoke. Treatment involves reliever inhalers (salbutamol/albuterol) for acute symptoms and preventer inhalers (corticosteroids) for long-term control. Severe attacks need emergency care.",
            "category": "chronic_conditions", "source": "GINA Guidelines"
        },
        # ── Nutrition and lifestyle ────────────────────────────────────────────
        {
            "id": "lifestyle_001",
            "text": "A healthy diet includes plenty of fruits and vegetables (at least 5 portions daily), whole grains, lean protein (fish, legumes, poultry), healthy fats (olive oil, nuts, avocado), and limited processed foods, sugar, and saturated fats. The Mediterranean diet pattern is associated with reduced cardiovascular disease risk.",
            "category": "lifestyle", "source": "WHO Guidelines"
        },
        {
            "id": "lifestyle_002",
            "text": "Physical activity recommendations for adults: at least 150-300 minutes of moderate aerobic activity (brisk walking, cycling) or 75-150 minutes of vigorous activity (running, swimming) per week, plus muscle-strengthening activities 2 or more days per week. Regular exercise reduces risk of heart disease, diabetes, depression, and some cancers.",
            "category": "lifestyle", "source": "WHO Physical Activity Guidelines"
        },
        {
            "id": "lifestyle_003",
            "text": "Sleep is essential for health. Adults need 7-9 hours per night. Sleep deprivation increases risk of obesity, diabetes, cardiovascular disease, and mental health problems. Good sleep hygiene: consistent sleep schedule, dark and cool room, avoid screens 1 hour before bed, limit caffeine after noon, avoid heavy meals before sleep.",
            "category": "lifestyle", "source": "Sleep Foundation"
        },
    ]

    # Generate embeddings in batches and add to ChromaDB
    texts = [chunk["text"] for chunk in knowledge_chunks]
    ids = [chunk["id"] for chunk in knowledge_chunks]
    metadatas = [{"category": chunk["category"], "source": chunk["source"]} for chunk in knowledge_chunks]

    embeddings = embedder.encode(texts, show_progress_bar=False).tolist()

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
    )


def retrieve_context(query: str, top_k: int = TOP_K) -> str:
    """
    Main function called by the chat service.
    Takes a user query, finds the most relevant medical knowledge,
    and returns it as a formatted string to inject into the AI prompt.
    """
    try:
        collection = _get_collection()
        embedder = _get_embedder()

        query_embedding = embedder.encode([query], show_progress_bar=False).tolist()

        results = collection.query(
            query_embeddings=query_embedding,
            n_results=min(top_k, collection.count()),
        )

        if not results["documents"] or not results["documents"][0]:
            return ""

        chunks = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]

        # Only include chunks that are actually relevant (distance below threshold)
        # ChromaDB cosine distance: 0 = identical, 2 = completely opposite
        # We use 1.0 as the cutoff — anything above is too dissimilar
        relevant = [
            (chunk, meta, dist)
            for chunk, meta, dist in zip(chunks, metadatas, distances)
            if dist < 1.0
        ]

        if not relevant:
            return ""

        context_parts = []
        for chunk, meta, _ in relevant:
            source = meta.get("source", "Medical Guidelines")
            context_parts.append(f"[Source: {source}]\n{chunk}")

        return "\n\n".join(context_parts)

    except Exception as e:
        print(f"[RAG] Retrieval error: {e}")
        return ""  # Fail silently — chat still works without RAG context


def initialise_rag():
    """Call this on app startup to pre-load the embedding model and knowledge base."""
    try:
        _get_collection()
    except Exception as e:
        print(f"[RAG] Initialisation error: {e}")
