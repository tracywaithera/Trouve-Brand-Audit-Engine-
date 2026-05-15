import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { BrandType, UserData } from '../types';

interface IntakeFormProps {
  brandType: BrandType;
  onBack: () => void;
  onSubmit: (data: UserData) => void;
  initialData?: Partial<UserData>;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({ brandType, onBack, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<UserData>>({
    brandType,
    tier: 'free',
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    brandName: initialData?.brandName || '',
    challenge: initialData?.challenge || '',
    role: initialData?.role || '',
    audience: initialData?.audience || '',
    platforms: initialData?.platforms || '',
    niche: initialData?.niche || '',
    monetise: initialData?.monetise || '',
    industry: initialData?.industry || '',
    teamSize: initialData?.teamSize || '',
    budget: initialData?.budget || '',
    link: initialData?.link || '',
    needDomain: initialData?.needDomain || '',
    competitors: initialData?.competitors || '',
    tone: initialData?.tone || '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brandName || !formData.challenge) {
      setError('Please fill in all required fields (*)');
      return;
    }

    if (brandType === 'personal' && !formData.role) {
      setError('Please select your role');
      return;
    }
    
    if (brandType === 'business' && !formData.industry) {
      setError('Please select your industry');
      return;
    }

    onSubmit({
      ...formData,
      brandType,
      ts: new Date().toISOString(),
    } as UserData);
  };

  const titles = {
    personal: { title: 'Audit your personal brand', sub: "We'll check your authority, content, and how much your audience trusts you." },
    faceless: { title: 'Audit your faceless brand', sub: "We'll check your niche, content strategy, and if you're ready to make money." },
    business: { title: 'Audit your business brand', sub: "We'll check your online presence, positioning, and how well you convert customers." }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-xl mx-auto px-6 py-12"
    >
      <div className="bg-paper border border-ink/10 rounded-2xl p-8 md:p-10 shadow-sm">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-ink-3 hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Change brand type
        </button>
        
        <h2 className="text-3xl font-serif mb-2">{titles[brandType].title}</h2>
        <p className="text-base text-ink-3 mb-10">{titles[brandType].sub}</p>
        
        <form onSubmit={handleFormSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-widest uppercase text-ink">Full Name *</label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tracy Waithera"
                className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all placeholder:text-ink/30"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold tracking-widest uppercase text-ink">WhatsApp</label>
              <input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+254 700 000 000"
                className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all placeholder:text-ink/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-widest uppercase text-ink">Brand Name *</label>
            <input 
              name="brandName"
              value={formData.brandName}
              onChange={handleChange}
              placeholder={brandType === 'faceless' ? 'e.g. AfricaRichMindset' : 'e.g. Trouve Marketing'}
              className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all placeholder:text-ink/30"
              required
            />
          </div>

          {brandType === 'personal' && (
            <>
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-widest uppercase text-ink">Your Role *</label>
                <input 
                  list="role-list"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Select or type your role..."
                  className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all placeholder:text-ink/30"
                  required
                />
                <datalist id="role-list">
                  <option value="Business consultant / strategist" />
                  <option value="Coach (life, career, fitness, etc.)" />
                  <option value="Content creator / influencer" />
                  <option value="Speaker / author" />
                  <option value="Freelancer / creative professional" />
                  <option value="Entrepreneur / founder" />
                  <option value="Executive / Leader" />
                  <option value="Artist / Designer" />
                  <option value="Real Estate Agent" />
                </datalist>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-widest uppercase text-ink">Target Audience</label>
                <input 
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  placeholder="e.g. African SME founders, 28–45"
                  className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all placeholder:text-ink/30"
                />
              </div>
            </>
          )}

          {brandType === 'faceless' && (
            <>
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-widest uppercase text-ink">Niche / Topic *</label>
                <input 
                  name="niche"
                  value={formData.niche}
                  onChange={handleChange}
                  placeholder="e.g. Financial literacy for African millennials"
                  className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all placeholder:text-ink/30"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-widest uppercase text-ink">Primary Platform *</label>
                <select 
                  name="platforms"
                  value={formData.platforms}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select platform</option>
                  <option>Instagram</option>
                  <option>TikTok</option>
                  <option>YouTube</option>
                  <option>LinkedIn</option>
                  <option>X (Twitter)</option>
                  <option>Newsletter / blog</option>
                </select>
              </div>
            </>
          )}

          {brandType === 'business' && (
            <>
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-widest uppercase text-ink">Industry *</label>
                <input 
                  list="industry-list"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="Select or type industry..."
                  className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all placeholder:text-ink/30"
                  required
                />
                <datalist id="industry-list">
                  <option value="Real estate" />
                  <option value="Fashion & retail" />
                  <option value="Finance & fintech" />
                  <option value="Health & wellness" />
                  <option value="Tech & SaaS" />
                  <option value="Professional services" />
                  <option value="Hospitality & Tourism" />
                  <option value="Education" />
                  <option value="Manufacturing" />
                  <option value="Agriculture" />
                  <option value="Creative Agency" />
                </datalist>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-widest uppercase text-ink">Team Size</label>
                  <select 
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option>Solo / 1 person</option>
                    <option>2–5 people</option>
                    <option>6–20 people</option>
                    <option>20+ people</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold tracking-widest uppercase text-ink">Budget</label>
                  <select 
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select range</option>
                    <option>Under KES 20k</option>
                    <option>KES 20k–50k</option>
                    <option>KES 50k–150k</option>
                    <option>Over KES 150k</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-widest uppercase text-ink">Link (Website/Social)</label>
            <input 
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all placeholder:text-ink/30"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-widest uppercase text-ink">Do you need a custom domain? (.com, .co.ke, etc.)</label>
            <select 
              name="needDomain"
              value={formData.needDomain}
              onChange={handleChange}
              className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all appearance-none cursor-pointer"
            >
              <option value="">Select an option</option>
              <option value="yes">Yes, I need one</option>
              <option value="no">No, I already have one</option>
              <option value="not_sure">I'm not sure yet</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-widest uppercase text-ink">Biggest Competitors (Top 1-3)</label>
            <input 
              name="competitors"
              value={formData.competitors}
              onChange={handleChange}
              placeholder="e.g. Acme Corp, Brand X..."
              className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all placeholder:text-ink/30"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-widest uppercase text-ink">Your Desired Tone of Voice</label>
            <select 
              name="tone"
              value={formData.tone}
              onChange={handleChange}
              className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all appearance-none cursor-pointer"
            >
              <option value="">Select tone</option>
              <option>Sharp & Sophisticated</option>
              <option>Witty & Bold</option>
              <option>Minimalist & Technical</option>
              <option>Warm & Relatable</option>
              <option>Professional & Authoritative</option>
              <option>Disruptive & Radical</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-widest uppercase text-ink">Biggest Challenge *</label>
            <textarea 
              name="challenge"
              value={formData.challenge}
              onChange={handleChange}
              placeholder="e.g. I post consistently but get no leads. My brand doesn't feel premium..."
              className="w-full px-5 py-4 text-base font-medium bg-white border border-ink/20 rounded-xl outline-none focus:border-gold transition-all min-h-[120px] resize-none placeholder:text-ink/30"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-custom/5 border border-red-custom/20 rounded-xl text-sm font-medium text-red-custom">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-5 bg-ink text-paper text-sm font-bold tracking-widest uppercase rounded-xl hover:bg-ink-2 transition-all shadow-sm hover:shadow-md active:scale-[0.98] mt-6"
          >
            Generate my brand audit →
          </button>
          
          <p className="text-[10px] text-center text-ink-3 mt-4">
            Your information is confidential. Trouve does not share or sell data.
          </p>
        </form>
      </div>
    </motion.div>
  );
};
