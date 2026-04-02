import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { UserData, AuditData, ChatMessage } from "../types";
import { AUDIT_SECTIONS } from "../constants";

export async function chatWithTrouve(messages: ChatMessage[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemInstruction = `
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
    personal: `This is a PERSONAL BRAND audit. The person IS the brand. Focus on: authority signals, thought leadership positioning, content-to-trust pipeline, personal story leverage, niche clarity, and whether they are differentiated or commoditised. Name: ${userData.brandName}. Role: ${userData.role}. Target audience: ${userData.audience || 'Not specified'}. Platforms: ${userData.platforms || 'Not specified'}. Link: ${userData.link || 'Not provided'}.`,
    faceless: `This is a FACELESS brand audit — no visible founder. Focus on: content consistency, niche authority without a face, audience trust building, monetisation readiness, content-to-revenue conversion, and platform algorithm alignment. Brand: ${userData.brandName}. Niche: ${userData.niche || 'Not specified'}. Primary platform: ${userData.platforms || 'Not specified'}. Monetisation: ${userData.monetise || 'Not specified'}. Link: ${userData.link || 'Not provided'}.`,
    business: `This is a BUSINESS BRAND audit. Focus on: digital presence strength, content quality, market positioning (commodity vs category leader), audience conversion gaps, ad readiness, and brand consistency. Business: ${userData.brandName}. Industry: ${userData.industry}. Team: ${userData.teamSize || 'Not specified'}. Marketing budget: ${userData.budget || 'Not specified'}. Link: ${userData.link || 'Not provided'}.`
  };

  const prompt = `
    You are the Chief Strategy Officer at Trouve Marketing Solutions, founded by Tracy Waithera in Nairobi. 
    You produce sharp, incisive, and deeply detailed brand audits for African brands. You are direct, specific, and professional. 
    You never give generic advice. You understand personal brands, faceless content brands, and business brands differently and audit them differently.

    ${promptContext[userData.brandType]}

    Biggest challenge: ${userData.challenge}
    Contact: ${userData.name}

    YOUR TASK:
    Generate a comprehensive brand audit that includes:
    1. Market Research: Analyze the current state of their specific niche/industry in the African context.
    2. Competitor Analysis: Identify what competitors are doing and where the gaps are.
    3. Differentiation (How to Stand Out): Provide specific strategies to become a category of one.
    4. Visibility & Growth: Actionable steps to increase reach and authority.

    Reference their challenge directly in at least two sections. Use sophisticated yet clear language. Be direct and bold. Be specific to the African market. If they need a domain (${userData.needDomain}), explain why a professional domain matters.
    
    The 'analysis' field for each section should be at least 3-4 sentences of deep, strategic insight.
    The 'finding' should be a punchy, high-level strategic observation.
    The 'action' should be a concrete, multi-step implementation plan.
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
          }
        },
        required: ["overall_score", "score_label", "executive_summary", "sections"]
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
