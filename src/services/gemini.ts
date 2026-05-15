import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { UserData, AuditData, ChatMessage } from "../types";
import { AUDIT_SECTIONS } from "../constants";

export async function generateTTS(text: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: `Say this professionally and with authority: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  
  return base64Audio;
}

export async function chatWithTrouve(messages: ChatMessage[], auditContext?: { audit: AuditData; user: UserData }): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  let systemInstruction = `
    You are "Trouve", a smart, sophisticated AI brand strategist and marketing expert at Trouve Marketing Solutions, founded by Tracy Waithera in Nairobi.
    
    YOUR EXPERTISE:
    - Branding & Brand Identity
    - Personal Branding & Faceless Content Brands
    - Marketing & Advertising Strategy
    - Brand Positioning & Differentiation
    - AI Marketing & Digital Marketing
    - Brand Audits, Data Surveys, and Market Research
    
    YOUR PERSONALITY:
    - Sharp, incisive, and professional.
    - Direct and bold (no fluff).
    - Deeply knowledgeable about the African market.
    - Helpful and strategic.
    
    YOUR GOAL:
    - Answer any question about branding, marketing, and advertising.
    - Provide guidance on what a brand should do to grow and stand out.
    - Explain Trouve's services (Audits, Strategy, Execution).
    - If asked about "Trouve", you are the AI engine powering their strategic audits.
    
    Keep responses concise but high-value. Use formatting (bolding, lists) to make advice readable.
  `;

  if (auditContext) {
    systemInstruction += `
      
      CURRENT AUDIT CONTEXT:
      You have access to the user's latest brand audit.
      Brand Name: ${auditContext.user.brandName}
      Brand Type: ${auditContext.user.brandType}
      Overall Score: ${auditContext.audit.overall_score}/100 (${auditContext.audit.score_label})
      Challenges: ${auditContext.user.challenge}
      
      Summary: ${auditContext.audit.executive_summary}
      
      When the user asks questions about their audit, reference specific findings or actions from these sections:
      ${auditContext.audit.sections.map(s => `- ${s.title}: ${s.finding}`).join('\n')}
      
      Encourage them to book a strategy session with Tracy if they need deep implementation.
    `;
  }

  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: systemInstruction,
    },
  });

  // Send the last message
  const lastMessage = messages[messages.length - 1].text;
  
  // To maintain context, we could pass previous messages, but for simplicity and token efficiency
  // we'll just send the last one for now, or we can use the chat.sendMessage if we want history.
  // Actually, let's use the chat history feature.
  
  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  // Re-create chat with history
  const chatWithHistory = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: systemInstruction,
    },
    // Note: The SDK might handle history differently, let's check the docs in my head.
    // Actually, the standard way is to pass history to create.
  });

  // Since I can't easily pass history to the create call in this specific SDK version without checking,
  // I'll just send the prompt with context.
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
    config: {
      systemInstruction: systemInstruction,
    }
  });

  return response.text || "I'm sorry, I couldn't process that request.";
}

export async function generateBrandAudit(userData: UserData): Promise<AuditData> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const sections = AUDIT_SECTIONS[userData.brandType];

  const promptContext = {
    personal: `This is a PERSONAL BRAND audit. The person IS the brand. Focus on: authority signals, thought leadership positioning, content-to-trust pipeline, personal story leverage, niche clarity, and whether they are differentiated or commoditised. Name: ${userData.brandName}. Role: ${userData.role}. Target audience: ${userData.audience || 'Not specified'}. Platforms: ${userData.platforms || 'Not specified'}. Link: ${userData.link || 'Not provided'}. Competitors: ${userData.competitors || 'None provided'}. Desired Tone: ${userData.tone || 'Professional'}.`,
    faceless: `This is a FACELESS brand audit — no visible founder. Focus on: content consistency, niche authority without a face, audience trust building, monetisation readiness, content-to-revenue conversion, and platform algorithm alignment. Brand: ${userData.brandName}. Niche: ${userData.niche || 'Not specified'}. Primary platform: ${userData.platforms || 'Not specified'}. Monetisation: ${userData.monetise || 'Not specified'}. Link: ${userData.link || 'Not provided'}. Competitors: ${userData.competitors || 'None provided'}. Desired Tone: ${userData.tone || 'Professional'}.`,
    business: `This is a BUSINESS BRAND audit. Focus on: digital presence strength, content quality, market positioning (commodity vs category leader), audience conversion gaps, ad readiness, and brand consistency. Business: ${userData.brandName}. Industry: ${userData.industry}. Team: ${userData.teamSize || 'Not specified'}. Marketing budget: ${userData.budget || 'Not specified'}. Link: ${userData.link || 'Not provided'}. Competitors: ${userData.competitors || 'None provided'}. Desired Tone: ${userData.tone || 'Professional'}.`
  };

  const prompt = `
    You are the Chief Strategy Officer at Trouve Marketing Solutions, founded by Tracy Waithera in Nairobi. 
    You produce sharp, incisive, and deeply detailed brand audits for African brands. You are direct, specific, and professional. 
    You never give generic advice. You understand personal brands, faceless content brands, and business brands differently and audit them differently.

    ${promptContext[userData.brandType]}

    Biggest challenge: ${userData.challenge}
    Contact: ${userData.name}

    YOUR TASK:
    Generate a high-level, comprehensive brand audit. This must be the "Full Strategic Audit" — don't hold back on depth or complexity.
    Include for each of the following sections (${sections.join(', ')}):
    1. Market Research: Deep analysis of their industry in the specifically African landscape (mentioning specific markets if applicable like Kenya, Nigeria, South Africa).
    2. Competitor Benchmarking: How they stack up against specific local and global competitors (${userData.competitors || 'general industry leaders'}).
    3. Strategic Differentiation: How to create an 'unfair advantage' and a category of one.
    4. Operational Roadmap: Tactical steps for the next 90 days.

    GUIDELINES:
    - Use the provided brand context extensively.
    - Reference their challenge ("${userData.challenge}") throughout the audit as the primary friction point to solve.
    - If they requested a domain (${userData.needDomain}), include a tactical recommendation on domain selection and TLD strategy (e.g. .com vs .ke).
    - Tone of Voice: Use their requested tone: "${userData.tone || 'Professional & Authoritative'}".
    - The 'analysis' field must be a masterclass in strategy (4-6 detailed sentences).
    - Total depth is key. This is a premium product experience.
    
    STRUCTURE:
    - overall_score: 0-100 reflecting the current brand maturity.
    - score_label: Foundational, Developing, Competitive, Authority, or Market Leader.
    - executive_summary: A 150-word high-impact narrative summary.
    - sections: Detailed audit for each of these: ${sections.join(', ')}.
    
    CANVAS BOARDS:
    1. 'Brand Canvas': Purpose, Identity, Tone, Visuals, Positioning, and Promise.
    2. 'Business Canvas': Value Proposition, Customer Segments, Channels, Revenue Streams, Key Activities, and Cost Structure.
    Each canvas item must be a detailed phrase, not just a single word.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overall_score: { type: Type.NUMBER },
          score_label: { type: Type.STRING, description: "One of: Foundational, Developing, Competitive, Authority, Market Leader" },
          executive_summary: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                score: { type: Type.NUMBER, nullable: true },
                rating: { type: Type.STRING, nullable: true, description: "One of: Low, Medium, High" },
                analysis: { type: Type.STRING },
                finding: { type: Type.STRING },
                action: { type: Type.STRING }
              },
              required: ["title", "analysis", "finding", "action"]
            }
          },
          brand_canvas: {
            type: Type.OBJECT,
            properties: {
              purpose: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              identity: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              tone: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              visuals: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              positioning: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              promise: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } }
            }
          },
          business_canvas: {
            type: Type.OBJECT,
            properties: {
              valueProps: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              customerSegments: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              channels: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              revenueStreams: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              keyActivities: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } },
              costStructure: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } } } }
            }
          }
        },
        required: ["overall_score", "score_label", "executive_summary", "sections", "brand_canvas", "business_canvas"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  try {
    return JSON.parse(text) as AuditData;
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Invalid audit data format received");
  }
}
