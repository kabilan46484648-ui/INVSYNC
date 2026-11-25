import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Setup from './components/Setup';
import Purchases from './components/Purchases';
import Suppliers from './components/Suppliers';
import Inventory from './components/Inventory';
import Reports from './components/Reports';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
