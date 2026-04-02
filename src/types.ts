export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type BrandType = 'personal' | 'faceless' | 'business';

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
}

export interface UserData {
  name: string;
  email?: string;
  phone: string;
  brandType: BrandType;
  brandName: string;
  challenge: string;
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
  ts: string;
}

export interface SavedAudit {
  id: string;
  userData: UserData;
  auditData: AuditData;
  timestamp: string;
}
