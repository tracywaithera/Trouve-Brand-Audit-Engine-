import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, setDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, signInWithGoogle, logout, db, handleFirestoreError, OperationType } from './lib/firebase';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { IntakeForm } from './components/IntakeForm';
import { AuditProgress } from './components/AuditProgress';
import { AuditReport } from './components/AuditReport';
import { History } from './components/History';
import { BrandProgress } from './components/BrandProgress';
import { TrouveBot } from './components/TrouveBot';
import { BrandType, UserData, AuditData, SavedAudit } from './types';
import { generateBrandAudit } from './services/gemini';

type Screen = 'home' | 'intake' | 'running' | 'report' | 'history' | 'progress';

const STORAGE_KEY = 'trouve_audit_session';
const HISTORY_KEY = 'trouve_audit_history';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const [brandType, setBrandType] = useState<BrandType | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [history, setHistory] = useState<SavedAudit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setHistory([]);
      }
    });
  }, []);

  // Sync history with Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'audits'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const audits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to ISO string for compatibility with existing types
        timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
      })) as SavedAudit[];
      setHistory(audits);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'audits');
    });

    return unsubscribe;
  }, [user]);

  // Load from memory (keeping session data but history now comes from Firestore)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    // HISTORY_KEY is deprecated now as we use Firestore

    if (saved) {
      try {
        const { screen: savedScreen, brandType: savedType, userData: savedUser, auditData: savedAudit } = JSON.parse(saved);
        setBrandType(savedType);
        setUserData(savedUser ? { ...savedUser, tier: savedUser.tier || 'free' } : null);
        setAuditData(savedAudit);
        // If they were on 'running', put them back on 'intake' to be safe
        setScreen(savedScreen === 'running' ? 'intake' : savedScreen);
      } catch (e) {
        console.error('Failed to load memory:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to memory (session only)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, brandType, userData, auditData }));
    }
  }, [screen, brandType, userData, auditData, isLoaded]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleSelectType = (type: BrandType) => {
    setBrandType(type);
    setScreen('intake');
  };

  const handleFormSubmit = async (data: UserData) => {
    setUserData(data);
    setScreen('running');
    setError(null);

    try {
      const result = await generateBrandAudit(data);
      setAuditData(result);
      
      // Save to Firestore ONLY if user is logged in
      if (user) {
        const auditPayload = {
          userId: user.uid,
          userData: data,
          auditData: result,
          timestamp: serverTimestamp()
        };
        await addDoc(collection(db, 'audits'), auditPayload);
      }
      
      setScreen('report');
    } catch (err) {
      console.error(err);
      setError('Audit generation failed. Please try again.');
      setScreen('intake');
    }
  };

  const handleReset = () => {
    setScreen('home');
    setBrandType(null);
    setUserData(null);
    setAuditData(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleBackToEdit = () => {
    setScreen('intake');
  };

  const handleViewHistory = () => {
    setScreen('history');
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleReset();
    } catch (err) {
      setError('Logout failed.');
    }
  };

  const handleDeleteAudit = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'audits', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `audits/${id}`);
    }
  };

  const handleViewAudit = (audit: SavedAudit) => {
    setUserData(audit.userData);
    setAuditData(audit.auditData);
    setBrandType(audit.userData.brandType);
    setScreen('report');
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onHistoryClick={handleViewHistory} 
        onEngineClick={handleReset} 
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow">
        {screen === 'home' && (
          <Home 
            onSelectType={handleSelectType} 
            onViewHistory={handleViewHistory}
            hasHistory={history.length > 0}
            user={user}
            onLogin={handleLogin}
          />
        )}
        
        {screen === 'intake' && brandType && (
          <IntakeForm 
            brandType={brandType} 
            onBack={() => setScreen('home')} 
            onSubmit={handleFormSubmit}
            initialData={userData || undefined}
          />
        )}
        
        {screen === 'running' && brandType && userData && (
          <AuditProgress 
            brandType={brandType} 
            brandName={userData.brandName} 
            onCancel={() => setScreen('intake')}
          />
        )}
        
        {screen === 'report' && auditData && userData && (
          <AuditReport 
            data={auditData} 
            userData={userData} 
            onReset={handleReset}
            onBackToEdit={handleBackToEdit}
            onBackToHistory={history.length > 0 ? handleViewHistory : undefined}
          />
        )}

        {screen === 'history' && (
          <History 
            history={history}
            onView={handleViewAudit}
            onDelete={handleDeleteAudit}
            onNewAudit={() => setScreen('home')}
            onViewProgress={() => setScreen('progress')}
          />
        )}

        {screen === 'progress' && (
          <BrandProgress 
            history={history}
            onBack={() => setScreen('history')}
          />
        )}
      </main>

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-custom text-white text-sm rounded-full shadow-lg z-50">
          {error}
        </div>
      )}

      <TrouveBot 
        user={user} 
        auditData={auditData} 
        userData={userData} 
      />

      <footer className="py-12 px-6 text-center border-t border-ink/5 bg-paper-2">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink font-bold mb-4">
            © {new Date().getFullYear()} Trouve Marketing Solutions · Nairobi, Kenya
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <a 
              href="https://trouvemarketingsolutions.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gold hover:text-gold-2 font-bold transition-colors"
            >
              Visit our website: trouvemarketingsolutions.com
            </a>
            <button 
              onClick={handleReset}
              className="text-xs text-ink-3 hover:text-ink font-bold transition-colors"
            >
              Brand Audit Engine
            </button>
            {history.length > 0 && (
              <button 
                onClick={handleViewHistory}
                className="text-xs text-ink-3 hover:text-ink font-bold transition-colors"
              >
                View Audit History
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
