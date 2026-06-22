/**
 * Production Anthropic Claude Client
 * Real integration for AI Sourcing Agent + Normalization
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY;

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  model: string;
  usage?: any;
}

export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  options: { maxTokens?: number; model?: string } = {}
): Promise<ClaudeResponse> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const { maxTokens = 1200, model = 'claude-3-5-sonnet-20241022' } = options;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    content: data.content?.[0]?.text || '',
    model: data.model,
    usage: data.usage,
  };
}

export async function extractStructuredTradeData(rawText: string): Promise<any> {
  const system = `You are DealCompass AI+ extraction engine. 
Extract structured trade opportunity data from the provided text.
Return ONLY valid JSON with these keys:
product_name, specification, category, quantity, unit, price, currency, 
origin_country, export_country, incoterm, company_name, contact_name, delivery_terms, confidence`;

  const { content } = await callClaude(system, `Text: ${rawText}\n\nReturn JSON only.`);
  
  try {
    return JSON.parse(content);
  } catch {
    return { error: 'Failed to parse LLM response', raw: content };
  }
}
