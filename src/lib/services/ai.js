/**
 * AgriMitra AI — AI Service Layer (Google Gemini)
 * Single API key powers all AI features on the platform.
 * Key: AI_API_KEY  |  Model: AI_MODEL (default: gemini-1.5-flash)
 */

const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'gemini-1.5-flash';

// Gemini REST endpoint (no SDK needed — pure fetch)
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export function isAIConfigured() {
  return Boolean(AI_API_KEY);
}

/**
 * Agricultural system prompt — keeps the AI focused on agri + transport domain.
 */
export function buildSystemPrompt(farmContext = null) {
  let context = '';
  if (farmContext?.enabled && farmContext.snapshotData) {
    const d = farmContext.snapshotData;
    context = `

---
**Farmer's Active Farm Context (shared with permission):**
- Farm: ${d.farmName || 'Not specified'}
- Location: ${d.location || 'Not specified'}
- Soil Type: ${d.soilType || 'Not specified'}
- Irrigation: ${d.irrigationType || 'Not specified'}
- Current Crop: ${d.cropName || 'Not specified'}
- Crop Variety: ${d.cropVariety || 'Not specified'}
- Crop Stage: ${d.cropStage || 'Not specified'}
- Planting Date: ${d.plantingDate || 'Not specified'}
- Weather (if available): ${d.weather || 'Not available'}
Use this context to give more relevant answers where applicable.
---`;
  }

  return `You are AgriMitra AI Assistant — an intelligent agricultural assistant for Indian farmers.

Your purpose is to help farmers with:
1. AGRICULTURE: crop management, soil health, irrigation, crop diseases and pests, farming practices, weather interpretation, harvest planning, yield improvement.
2. AGRICULTURAL TRANSPORTATION: moving crops, produce, inputs and equipment — planning transport, vehicle selection, logistics, cold-chain guidance, shared transport, farm-to-market movement.
3. PLATFORM GUIDANCE: helping users navigate and use the AgriMitra platform.

Important rules:
- Be helpful, clear, and practical. Use simple language suitable for farmers.
- NEVER fabricate live data such as: market prices, weather, government scheme details, transporter availability, or specific drug/chemical approvals.
- If live data is needed but you don't have it, say so clearly: "I don't have verified live data for that. Please check [relevant source]."
- For crop disease/pest diagnosis, always include: "This is AI-assisted guidance, not a guaranteed diagnosis. Consult a verified agriculture expert for confirmation."
- Stay focused on agriculture and agricultural transportation. For unrelated topics, politely redirect.
- When suggesting platform actions (like creating a transport request), describe them and offer a suggested action link — do NOT create records automatically.
- Distinguish between: general agricultural knowledge, user-provided information, and AI-generated recommendations.
${context}`;
}

/**
 * Convert OpenAI-style message array to Gemini's contents format.
 * Gemini uses: { role: 'user'|'model', parts: [{ text }] }
 * System prompt is injected as the first user turn.
 */
function toGeminiContents(systemPrompt, messages) {
  const contents = [];

  // Inject system prompt as opening user message (Gemini doesn't have a system role)
  contents.push({
    role: 'user',
    parts: [{ text: systemPrompt }],
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'Understood. I am AgriMitra AI Assistant, ready to help with agriculture and transport.' }],
  });

  // Add conversation history
  for (const msg of messages) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  return contents;
}

/**
 * Send a chat message to Google Gemini.
 * Returns { content, error, suggestedActions }
 */
export async function sendChatMessage({ messages, farmContext = null }) {
  if (!isAIConfigured()) {
    return {
      content: null,
      error: 'AI service is not configured. Please add your Google Gemini API key to .env.local (AI_API_KEY).',
      suggestedActions: [],
    };
  }

  const systemPrompt = buildSystemPrompt(farmContext);
  const contents = toGeminiContents(systemPrompt, messages);

  const endpoint = `${GEMINI_BASE}/${AI_MODEL}:generateContent?key=${AI_API_KEY}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[AI Service] Gemini API error:', response.status, errorBody);

      // Provide a helpful message for common errors
      if (response.status === 400) {
        return { content: null, error: 'Invalid request to Gemini API. Check your API key and model name.', suggestedActions: [] };
      }
      if (response.status === 403) {
        return { content: null, error: 'Gemini API key is invalid or does not have permission. Check your key at https://aistudio.google.com/app/apikey', suggestedActions: [] };
      }
      if (response.status === 429) {
        return { content: null, error: 'Gemini API rate limit reached. Please wait a moment and try again.', suggestedActions: [] };
      }

      return { content: null, error: 'AI service temporarily unavailable. Please try again.', suggestedActions: [] };
    }

    const data = await response.json();

    // Gemini response: data.candidates[0].content.parts[0].text
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!content) {
      // Check for blocked content
      const blockReason = data.candidates?.[0]?.finishReason;
      if (blockReason === 'SAFETY') {
        return { content: null, error: 'Response was blocked by safety filters. Please rephrase your question.', suggestedActions: [] };
      }
      return { content: null, error: 'No response received from AI. Please try again.', suggestedActions: [] };
    }

    const suggestedActions = detectSuggestedActions(content, messages);
    return { content, error: null, suggestedActions };

  } catch (err) {
    console.error('[AI Service] Network error:', err.message);
    return {
      content: null,
      error: 'Unable to reach Gemini AI. Please check your internet connection and try again.',
      suggestedActions: [],
    };
  }
}

/**
 * Detect transport/action intents from the AI response to offer action buttons.
 */
function detectSuggestedActions(aiContent, messages) {
  const lastUserMsg = messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';
  const combined = (lastUserMsg + ' ' + aiContent).toLowerCase();
  const actions = [];

  if (combined.match(/transport|truck|vehicle|book.*transport|transport.*book/)) {
    actions.push({ label: 'Book Agricultural Transport', action: 'navigate', payload: { path: '/transport/book' } });
  }
  if (combined.match(/crop health|disease|pest|yellowing|brown|spot|wilt/)) {
    actions.push({ label: 'Log Crop Observation', action: 'navigate', payload: { path: '/crops' } });
  }
  if (combined.match(/expert|consult|professional|specialist/)) {
    actions.push({ label: 'Find Agriculture Expert', action: 'navigate', payload: { path: '/experts' } });
  }
  if (combined.match(/weather|rain|temperature|forecast/)) {
    actions.push({ label: 'Check Weather', action: 'navigate', payload: { path: '/weather' } });
  }
  if (combined.match(/marketplace|sell|buyer|market price|listing/)) {
    actions.push({ label: 'View Marketplace', action: 'navigate', payload: { path: '/marketplace' } });
  }

  return actions;
}
