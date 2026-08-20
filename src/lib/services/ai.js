/**
 * AgriMitra AI — AI Service Layer
 * Abstracts the AI provider so the chatbot UI never changes when switching providers.
 * Reads: AI_API_KEY, AI_API_URL, AI_MODEL
 */

const AI_API_KEY = process.env.AI_API_KEY;
const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

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
\n---\n**Farmer's Active Farm Context (shared with permission):**
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
 * Send a chat message to the AI provider.
 * Returns { content, error, suggestedActions }
 */
export async function sendChatMessage({ messages, farmContext = null }) {
  if (!isAIConfigured()) {
    return {
      content: null,
      error: 'AI service is not configured. Please contact the platform administrator to set up the AI API key.',
      suggestedActions: [],
    };
  }

  const systemPrompt = buildSystemPrompt(farmContext);

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const response = await fetch(`${AI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: apiMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[AI Service] API error:', response.status, errorBody);
      return {
        content: null,
        error: 'AI service temporarily unavailable. Please try again.',
        suggestedActions: [],
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Simple transport intent detection for suggested actions
    const suggestedActions = detectSuggestedActions(content, messages);

    return { content, error: null, suggestedActions };
  } catch (err) {
    console.error('[AI Service] Network error:', err.message);
    return {
      content: null,
      error: 'AI service temporarily unavailable. Please check your connection and try again.',
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
    actions.push({ label: '🚜 Book Agricultural Transport', action: 'navigate', payload: { path: '/transport/book' } });
  }
  if (combined.match(/crop health|disease|pest|yellowing|brown|spot|wilt/)) {
    actions.push({ label: '🌾 Log Crop Observation', action: 'navigate', payload: { path: '/crops' } });
  }
  if (combined.match(/expert|consult|professional|specialist/)) {
    actions.push({ label: '👨‍🌾 Find Agriculture Expert', action: 'navigate', payload: { path: '/experts' } });
  }
  if (combined.match(/weather|rain|temperature|forecast/)) {
    actions.push({ label: '🌤 Check Weather', action: 'navigate', payload: { path: '/weather' } });
  }
  if (combined.match(/marketplace|sell|buyer|market price|listing/)) {
    actions.push({ label: '🏪 View Marketplace', action: 'navigate', payload: { path: '/marketplace' } });
  }

  return actions;
}
