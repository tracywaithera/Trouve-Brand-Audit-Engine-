import { BrandType } from './types';

export const BRAND_LABELS: Record<BrandType, string> = {
  personal: 'Personal Brand',
  faceless: 'Faceless Brand',
  business: 'Business Brand',
};

export const AUDIT_STEPS: Record<BrandType, string[]> = {
  personal: [
    'Scanning personal brand digital footprint',
    'Conducting market research and niche analysis',
    'Performing competitor gap analysis',
    'Evaluating thought leadership and content',
    'Assessing authority positioning and visibility',
    'Building your 90-day authority roadmap',
  ],
  faceless: [
    'Scanning brand identity and content strategy',
    'Conducting market research and niche analysis',
    'Performing competitor gap analysis',
    'Evaluating content consistency and quality',
    'Assessing audience growth and visibility levers',
    'Building your 90-day growth roadmap',
  ],
  business: [
    'Scanning digital presence and brand signals',
    'Conducting market research and industry analysis',
    'Performing competitor gap analysis',
    'Evaluating content and storytelling quality',
    'Assessing market positioning and visibility',
    'Generating your 90-day action plan',
  ],
};

export const AUDIT_SECTIONS: Record<BrandType, string[]> = {
  personal: [
    'Digital authority',
    'Content & storytelling',
    'Niche positioning',
    'Audience trust & conversion',
    'Monetisation readiness',
    '90-day authority plan',
  ],
  faceless: [
    'Brand identity & consistency',
    'Content strategy',
    'Niche authority',
    'Audience growth & engagement',
    'Monetisation readiness',
    '90-day growth plan',
  ],
  business: [
    'Digital presence',
    'Content & storytelling',
    'Market positioning',
    'Audience fit & conversion',
    'Ad readiness',
    '90-day action plan',
  ],
};
