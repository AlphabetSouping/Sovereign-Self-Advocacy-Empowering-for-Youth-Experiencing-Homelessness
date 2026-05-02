# Technical Roadmap: Full Development Plan
**Architecture: Firebase + GCP + Google AI Studio**

## 1. Backend & Data Infrastructure (Firebase Focus)

### Database: Firestore (Enterprise Edition)
*   **Sovereign Collection Strategy:** 
    *   `/users/{uid}/private/sovereign_identity`: Encrypted PII.
    *   `/users/{uid}/public/profile`: Youth-defined public persona.
    *   `/demands/`: Global collection of "Radicle" submissions for transparency.
*   **Security Rules:** Attribute-Based Access Control (ABAC). No read access allowed for adult agencies without explicit youth-granted "Trust Tokens."

### Authentication
*   **Anonymous-First:** Allow participation via anonymous auth.
*   **Sovereign Migration:** Capability to upgrade anonymous accounts to full accounts while maintaining data control.

## 2. AI & Local Features (Google AI Studio / Gemini)

### Narrative Engine (Education Portal)
*   **API:** Gemini 1.5 Pro for scenario generation.
*   **Prompt Engineering:** Grounding models in Liberation Psychology and CRT to ensure non-paternalistic output.
*   **Personalization:** Real-time generation of anime/drama scripts based on user-selected local housing issues.

### The Mirror Rep
*   **Hybrid Model:** Gemini-powered chatbot fine-tuned on trauma-informed clinical datasets.
*   **Professional Loop:** Ability for human therapists to review anonymized logs and inject "Professional Insights" that the AI then mirrors to the user.

## 3. Sustainability & Renewable Resourcing
*   **Technical Efficiency:** Utilizing Edge Functions (Firebase Cloud Functions) to minimize compute overhead and carbon footprint.
*   **Digital Sovereignty:** Ensuring data resides in green energy GCP regions.

## 4. Data Analytics & Impact Tracking
*   **Privacy-First Metrics:** Aggregated, non-identifiable tracking of "Demand Trends."
*   **Success Aspecting:** NLP analysis of shifts in user sentiment from "circumstance-focused" to "core-focused" narratives.
