import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

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
            <div className="text-right" style={{ display: 'none', '@media (min-width: 640px)': { display: 'block' } }}>
                <p className="font-medium text-sm">João Silva</p>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Plano Familiar</p>
            </div>
            <div className="user-avatar">
                JS
            </div>
        </div>
      </div>
    </header>
  );
};

const Shell = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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
            {children}
        </div>
      </main>
    </div>
  );
};

export default Shell;
