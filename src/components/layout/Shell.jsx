import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, Loader2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="flex items-center">
            <button onClick={toggleSidebar} className="menu-toggle">
                <Menu size={24} />
            </button>
            <h1 className="font-medium" style={{ marginLeft: 'var(--spacing-4)' }}>FinEdu</h1>
        </div>
        <div className="user-profile">
            <div className="text-right desktop-only">
                <p className="font-medium text-sm">Familia Pérez</p>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Plano Familiar</p>
            </div>
            <div className="user-avatar">
                FP
            </div>
        </div>
      </div>
    </header>
  );
};

const Shell = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const { loading } = useFinance();

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 30 }}
        />
      )}

      <Header toggleSidebar={toggleSidebar} />
      
      <main className="main-content">
        <div className="container">
            {loading ? (
                <div className="flex items-center justify-center p-8 h-full" style={{ minHeight: '50vh' }}>
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <span className="ml-4 text-muted">Carregando dados...</span>
                </div>
            ) : children}
        </div>
      </main>
    </div>
  );
};

export default Shell;
