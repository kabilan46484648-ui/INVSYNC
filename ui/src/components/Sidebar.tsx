import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Box, TrendingUp, ClipboardList, ShoppingCart, FileBarChart2 } from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">
          <TrendingUp className="icon-glow" size={28} />
        </div>
        <h2 className="brand-name">InvSync</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/setup" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ClipboardList size={20} />
          <span>Setup</span>
        </NavLink>
        <NavLink to="/purchases" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingCart size={20} />
          <span>Purchase</span>
        </NavLink>
        <NavLink to="/suppliers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Suppliers</span>
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Box size={20} />
          <span>Inventory</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileBarChart2 size={20} />
          <span>Reports</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">A</div>
          <div className="user-info">
            <span className="user-name">Admin User</span>
            <span className="user-role">System Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
