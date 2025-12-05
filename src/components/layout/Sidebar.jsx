import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, Target, PieChart, Settings } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: <Home size={20} />, label: 'Visão Geral', path: '/' },
    { icon: <Wallet size={20} />, label: 'Transações', path: '/transactions' },
    { icon: <Target size={20} />, label: 'Metas e Planos', path: '/goals' },
    { icon: <PieChart size={20} />, label: 'Relatórios', path: '/reports' },
    { icon: <Settings size={20} />, label: 'Configurações', path: '/settings' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <div className="sidebar-logo">
          <Target size={28} />
          <span>FinEdu</span>
        </div>
        <ul className="nav-list">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
                <li key={index}>
                <Link 
                    to={item.path} 
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => { if(window.innerWidth < 768) toggleSidebar() }}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </Link>
                </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
