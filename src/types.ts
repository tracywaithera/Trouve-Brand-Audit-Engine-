export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type BrandType = 'personal' | 'faceless' | 'business';
export type UserTier = 'free' | 'pro';

export interface CanvasBlock {
  title: string;
  items: string[];
}

export interface BrandCanvas {
  purpose: CanvasBlock;
  identity: CanvasBlock;
  tone: CanvasBlock;
  visuals: CanvasBlock;
  positioning: CanvasBlock;
  promise: CanvasBlock;
}

export interface BusinessCanvas {
  valueProps: CanvasBlock;
  customerSegments: CanvasBlock;
  channels: CanvasBlock;
  revenueStreams: CanvasBlock;
  keyActivities: CanvasBlock;
  costStructure: CanvasBlock;
}

export interface AuditSection {
  title: string;
  score: number | null;
  rating: 'Low' | 'Medium' | 'High' | null;
  analysis: string;
  finding: string;
  action: string;
}

export interface AuditData {
  overall_score: number;
  score_label: string;
  executive_summary: string;
  sections: AuditSection[];
  brand_canvas?: BrandCanvas;
  business_canvas?: BusinessCanvas;
}

export interface UserData {
  name: string;
  email?: string;
  phone: string;
  brandType: BrandType;
  brandName: string;
  challenge: string;
  tier: UserTier;
  // Personal specific
  role?: string;
  audience?: string;
  platforms?: string;
  // Faceless specific
  niche?: string;
  monetise?: string;
  // Business specific
  industry?: string;
  teamSize?: string;
  budget?: string;
  // Common
  link?: string;
  needDomain?: string;
  competitors?: string;
  tone?: string;
  ts: string;
}

export interface SavedAudit {
  id: string;
  userData: UserData;
  auditData: AuditData;
  timestamp: string;
}
