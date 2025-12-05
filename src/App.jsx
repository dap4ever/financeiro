import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import Shell from './components/layout/Shell';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';

const Reports = () => <div className="p-4">Relatórios (Em breve)</div>;
const Settings = () => <div className="p-4">Configurações (Em breve)</div>;

function App() {
  return (
    <FinanceProvider>
      <Router>
        <Shell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Shell>
      </Router>
    </FinanceProvider>
  );
}

export default App;
