'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck,
  Bell, BrainCircuit, BriefcaseBusiness, Check, ChevronDown, ChevronRight,
  CircleHelp, ClipboardList, Clock3, FilePlus2, Filter, Gauge, IndianRupee,
  LayoutDashboard, LogOut, MapPin, Menu, MessageSquareText, MoreHorizontal,
  Search, Settings2, ShieldCheck, Sparkles, TrendingUp, Users, WalletCards,
  Waves, X, Zap,
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';

const initialComplaints = [
  { id: 'NR-2026-0842', title: 'Water main burst near MG Road', category: 'Water', department: 'Water', location: 'Ward 08 · MG Road', urgency: 'Critical', status: 'Work in Progress', time: '12 min ago', budget: 185000, expenditure: 92300, citizen: 'Ananya Rao' },
  { id: 'NR-2026-0841', title: 'Exposed power cable in public park', category: 'Electricity', department: 'Electricity', location: 'Ward 14 · Lakeview Park', urgency: 'High', status: 'Department Assigned', time: '28 min ago', budget: 62000, expenditure: 0, citizen: 'Rohan Mehta' },
  { id: 'NR-2026-0840', title: 'Bridge surface damage on school route', category: 'Infrastructure', department: 'Infrastructure', location: 'Ward 03 · River Bridge', urgency: 'Critical', status: 'Budget Allotted', time: '46 min ago', budget: 420000, expenditure: 85000, citizen: 'Meera Iyer' },
  { id: 'NR-2026-0839', title: 'Overflowing community waste bins', category: 'Waste Management', department: 'Waste Management', location: 'Ward 11 · Market Square', urgency: 'Medium', status: 'AI Categorized', time: '1 hr ago', budget: 18000, expenditure: 0, citizen: 'Kabir Shah' },
  { id: 'NR-2026-0838', title: 'Street light outage on 5th Avenue', category: 'Electricity', department: 'Electricity', location: 'Ward 05 · 5th Avenue', urgency: 'Low', status: 'Resolved', time: '2 hrs ago', budget: 12000, expenditure: 11350, citizen: 'Priya Nair' },
];

function uniqueComplaints(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || typeof item.id !== 'string' || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

const trendData = [
  { day: 'Mon', filed: 38, resolved: 25 }, { day: 'Tue', filed: 51, resolved: 34 },
  { day: 'Wed', filed: 42, resolved: 31 }, { day: 'Thu', filed: 67, resolved: 45 },
  { day: 'Fri', filed: 56, resolved: 42 }, { day: 'Sat', filed: 73, resolved: 48 },
  { day: 'Sun', filed: 62, resolved: 52 },
];
const departmentData = [
  { name: 'Water', value: 31, color: '#237f68' }, { name: 'Electricity', value: 24, color: '#e9a23b' },
  { name: 'Infrastructure', value: 22, color: '#6275c8' }, { name: 'Waste', value: 15, color: '#54a2a3' },
  { name: 'Other', value: 8, color: '#d8d9d3' },
];
const formatMoney = (value) => `₹${(value / 100000).toFixed(value >= 100000 ? 1 : 2)}L`;

function Brand({ compact = false }) {
  return <div className={`brand ${compact ? 'brand-compact' : ''}`}><span className="brand-mark"><Waves size={21} strokeWidth={2.2} /></span><span className="brand-copy"><strong>Nirnaya</strong><small>PUBLIC SERVICE INTELLIGENCE</small></span></div>;
}

function StatusPill({ children }) {
  const statusClass = children.toLowerCase().replaceAll(' ', '-');
  return <span className={`status-pill status-${statusClass}`}><i />{children}</span>;
}

function UrgencyPill({ level }) {
  return <span className={`urgency-pill urgency-${level.toLowerCase()}`}><span />{level}</span>;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><strong>{label}</strong>{payload.map((item) => <span key={item.dataKey}><i style={{ background: item.color }} />{item.name}: {item.value}</span>)}</div>;
}

export default function Home() {
  const [role, setRole] = useState('admin');
  const [activeNav, setActiveNav] = useState('Overview');
  const [complaints, setComplaints] = useState(initialComplaints);
  const [filter, setFilter] = useState('All priorities');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Water', location: '', description: '' });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nirnaya-complaints') || '[]');
      if (Array.isArray(saved)) {
        const uniqueSaved = uniqueComplaints(saved);
        if (uniqueSaved.length !== saved.length) {
          localStorage.setItem('nirnaya-complaints', JSON.stringify(uniqueSaved));
        }
        if (uniqueSaved.length) {
          setComplaints((current) => uniqueComplaints([...uniqueSaved, ...current]));
        }
      }
    } catch { /* Ignore invalid demo storage. */ }
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredComplaints = useMemo(() => complaints.filter((item) => {
    const matchesPriority = filter === 'All priorities' || item.urgency === filter;
    const matchesSearch = `${item.title} ${item.id} ${item.department} ${item.location}`.toLowerCase().includes(search.toLowerCase());
    return matchesPriority && matchesSearch;
  }), [complaints, filter, search]);

  const showToast = (message) => setToast(message);
  const switchRole = (nextRole) => {
    setRole(nextRole);
    setActiveNav(nextRole === 'admin' ? 'Overview' : 'My complaints');
    setMobileNav(false);
  };

  async function submitComplaint(event) {
    event.preventDefault();
    try {
      const response = await fetch('/api/complaints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not submit complaint');
      const newComplaint = { ...result, time: 'Just now', citizen: 'You', status: 'Department Assigned' };
      setComplaints((current) => uniqueComplaints([newComplaint, ...current]));
      const saved = JSON.parse(localStorage.getItem('nirnaya-complaints') || '[]');
      localStorage.setItem('nirnaya-complaints', JSON.stringify(uniqueComplaints([newComplaint, ...(Array.isArray(saved) ? saved : [])])));
      setForm({ title: '', category: 'Water', location: '', description: '' });
      setModal('');
      setActiveNav('My complaints');
      setRole('citizen');
      showToast(`Complaint ${result.id} submitted · ${result.urgency} priority`);
    } catch (error) {
      showToast(error.message || 'Unable to submit. Please try again.');
    }
  }

  function confirmOtp(event) {
    event.preventDefault();
    if (otp !== '123456') {
      showToast('Use demo OTP 123456 to continue.');
      return;
    }
    setModal('');
    setOtpStep(false);
    setOtp('');
    switchRole('citizen');
    showToast('Welcome to your citizen portal.');
  }

  const isAdmin = role === 'admin';
  const navItems = isAdmin
    ? [{ label: 'Overview', icon: LayoutDashboard }, { label: 'Grievances', icon: ClipboardList, count: '24' }, { label: 'Budget & Audit', icon: WalletCards, alert: true }, { label: 'AI diagnostics', icon: BrainCircuit }]
    : [{ label: 'My complaints', icon: ClipboardList }, { label: 'File a grievance', icon: FilePlus2 }, { label: 'Transparency', icon: ShieldCheck }];

  return (
    <div className={`app-shell ${mobileNav ? 'nav-open' : ''}`}>
      {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <aside className="sidebar">
        <div className="sidebar-top"><Brand /><button className="icon-button sidebar-close" aria-label="Close menu" onClick={() => setMobileNav(false)}><X size={18} /></button></div>
        <div className="workspace-switch"><span className="workspace-emblem">{isAdmin ? 'MC' : 'CP'}</span><span><b>{isAdmin ? 'Metro City Council' : 'Citizen portal'}</b><small>{isAdmin ? 'Executive workspace' : 'Public services'}</small></span><ChevronDown size={15} /></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ label, icon: Icon, count, alert }) => <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => { setActiveNav(label); setMobileNav(false); if (label === 'File a grievance') setModal('complaint'); }}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{count && <em>{count}</em>}{alert && <i className="nav-alert" />}</button>)}
        </nav>
        <div className="nav-label nav-label-spaced">{isAdmin ? 'INTELLIGENCE' : 'YOUR ACCOUNT'}</div>
        <nav className="main-nav">
          {(isAdmin ? [{ label: 'Department teams', icon: Users }, { label: 'Service map', icon: MapPin }] : [{ label: 'Help & support', icon: CircleHelp }, { label: 'Profile & settings', icon: Settings2 }]).map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => { setActiveNav(label); setMobileNav(false); }}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon"><CircleHelp size={17} /></span><strong>{isAdmin ? 'Need a hand?' : 'We’re here to help'}</strong><p>{isAdmin ? 'Explore the guide to get more from Nirnaya.' : 'Call the public helpline anytime.'}</p><button onClick={() => showToast(isAdmin ? 'Admin guide opened in demo mode.' : 'Public helpline: 1800-200-0112')}>{isAdmin ? 'Open admin guide' : '1800-200-0112'} <ArrowRight size={14} /></button></div>
          <button className="user-profile" onClick={() => { setModal(isAdmin ? 'admin-login' : 'citizen-login'); setOtpStep(false); }}><span className={`avatar ${isAdmin ? 'avatar-admin' : ''}`}>{isAdmin ? 'AS' : 'AM'}</span><span><b>{isAdmin ? 'Aarav Sharma' : 'Ananya Mehta'}</b><small>{isAdmin ? 'City administrator' : 'Verified citizen'}</small></span><MoreHorizontal size={19} /></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><b>{activeNav}</b></div>
          <div className="topbar-actions"><div className="system-status"><span /> All systems operational</div><button className="icon-button top-search" aria-label="Search" onClick={() => document.getElementById('global-search')?.focus()}><Search size={18} /></button><button className="icon-button notification-button" aria-label="Notifications" onClick={() => showToast('You’re all caught up.')}><Bell size={18} /><i /></button><span className="topbar-divider" /><button className="language-switch" onClick={() => showToast('Hindi language support is coming soon.')}>EN <ChevronDown size={13} /></button></div>
        </header>

        <div className="content-wrap">
          <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> {isAdmin ? 'TUESDAY, 10 NOVEMBER 2026' : 'CITIZEN SERVICE PORTAL'}</div><h1>{activeNav === 'Overview' ? 'Good morning, Aarav' : activeNav === 'My complaints' ? 'Your complaints' : activeNav === 'Budget & Audit' ? 'Budget & audit' : activeNav === 'AI diagnostics' ? 'AI diagnostics' : activeNav}</h1><p>{isAdmin ? 'Here’s what’s happening across your city today.' : 'Track progress, stay informed, and help your city move forward.'}</p></div><div className="heading-actions"><button className="outline-button" onClick={() => showToast('Report exported as a demo CSV.')}> <ArrowDownRight size={15} /> Export report</button><button className="primary-button" onClick={() => setModal(isAdmin ? 'complaint' : 'complaint')}><FilePlus2 size={16} /> {isAdmin ? 'New grievance' : 'File a grievance'}</button></div></div>

          {isAdmin && (activeNav === 'Overview' || activeNav === 'Grievances' || activeNav === 'Department teams' || activeNav === 'Service map') && <>
            <div className="metric-grid">
              <article className="metric-card"><div className="metric-top"><span>Total grievances</span><span className="metric-icon icon-green"><ClipboardList size={18} /></span></div><div className="metric-value">1,284</div><div className="metric-foot"><span className="trend-positive"><ArrowUpRight size={14} /> 12.8%</span><span>vs. last month</span><span className="metric-period">This month</span></div><div className="metric-spark spark-green"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div></article>
              <article className="metric-card"><div className="metric-top"><span>Critical alerts</span><span className="metric-icon icon-red"><AlertTriangle size={18} /></span></div><div className="metric-value">08 <span className="metric-subvalue">need attention</span></div><div className="metric-foot"><span className="trend-negative"><ArrowUpRight size={14} /> 2 new</span><span>in the last hour</span><span className="metric-period red-period">Urgent</span></div><div className="metric-spark spark-red"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div></article>
              <article className="metric-card"><div className="metric-top"><span>Budget allocated</span><span className="metric-icon icon-amber"><IndianRupee size={18} /></span></div><div className="metric-value">₹2.84<span className="metric-unit">Cr</span></div><div className="metric-foot"><span>₹1.92 Cr utilized</span><span className="progress-mini"><i /></span><span className="metric-percent">68%</span></div><div className="metric-spark spark-amber"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div></article>
              <article className="metric-card"><div className="metric-top"><span>Resolved this month</span><span className="metric-icon icon-blue"><BadgeCheck size={18} /></span></div><div className="metric-value">76.4<span className="metric-unit">%</span></div><div className="metric-foot"><span className="trend-positive"><ArrowUpRight size={14} /> 4.2%</span><span>resolution rate</span><span className="metric-period">On track</span></div><div className="metric-spark spark-blue"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div></article>
            </div>

            <div className="dashboard-grid">
              <section className="panel trend-panel"><div className="panel-heading"><div><h2>Grievance activity</h2><p>Intake and resolution across the city</p></div><button className="select-button" onClick={() => showToast('Showing the last 7 days.')}>Last 7 days <ChevronDown size={14} /></button></div><div className="chart-legend"><span><i className="legend-filed" /> Filed <b>389</b></span><span><i className="legend-resolved" /> Resolved <b>277</b></span><span className="chart-insight"><TrendingUp size={14} /> Resolution up 8.4%</span></div><div className="activity-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 10, right: 4, left: -21, bottom: 0 }}><defs><linearGradient id="filedGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2c8a72" stopOpacity={0.13} /><stop offset="95%" stopColor="#2c8a72" stopOpacity={0} /></linearGradient><linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#88b9a2" stopOpacity={0.12} /><stop offset="95%" stopColor="#88b9a2" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#eef0ec" strokeDasharray="3 4" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#929a94', fontSize: 11 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#929a94', fontSize: 11 }} ticks={[0, 20, 40, 60, 80]} /><Tooltip content={<ChartTooltip />} /><Area name="Filed" type="monotone" dataKey="filed" stroke="#247f69" strokeWidth={2.5} fill="url(#filedGradient)" /><Area name="Resolved" type="monotone" dataKey="resolved" stroke="#a9c5b5" strokeWidth={2} fill="url(#resolvedGradient)" /></AreaChart></ResponsiveContainer></div></section>

              <section className="panel urgency-panel"><div className="panel-heading"><div><h2>Priority overview</h2><p>Open cases by urgency level</p></div><button className="more-button" aria-label="More priority options" onClick={() => showToast('Priority data refreshed.')}>···</button></div><div className="priority-total"><strong>247</strong><span>open grievances</span></div><div className="priority-bars"><div className="priority-row"><div><UrgencyPill level="Critical" /><b>08</b><span>3.2%</span></div><div className="priority-track"><i className="fill-critical" style={{ width: '12%' }} /></div></div><div className="priority-row"><div><UrgencyPill level="High" /><b>34</b><span>13.8%</span></div><div className="priority-track"><i className="fill-high" style={{ width: '31%' }} /></div></div><div className="priority-row"><div><UrgencyPill level="Medium" /><b>116</b><span>46.9%</span></div><div className="priority-track"><i className="fill-medium" style={{ width: '72%' }} /></div></div><div className="priority-row"><div><UrgencyPill level="Low" /><b>89</b><span>36.1%</span></div><div className="priority-track"><i className="fill-low" style={{ width: '59%' }} /></div></div></div><button className="text-link" onClick={() => { setActiveNav('Grievances'); setFilter('Critical'); }}>View priority queue <ArrowRight size={14} /></button></section>
            </div>

            <div className="lower-grid">
              <section className="panel grievance-panel"><div className="panel-heading grievance-heading"><div><h2>Priority grievance queue <span className="live-dot" /></h2><p>Stay ahead of what needs attention</p></div><button className="text-link" onClick={() => { setActiveNav('Grievances'); setFilter('All priorities'); }}>View all grievances <ArrowRight size={14} /></button></div><div className="table-toolbar"><label className="search-box"><Search size={15} /><input id="global-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search grievances..." /></label><button className="filter-button" onClick={() => setFilter(filter === 'All priorities' ? 'Critical' : filter === 'Critical' ? 'High' : 'All priorities')}><Filter size={14} /> {filter} <ChevronDown size={13} /></button></div><div className="table-wrap"><table><thead><tr><th>GRIEVANCE</th><th>DEPARTMENT</th><th>PRIORITY</th><th>STATUS</th><th>REPORTED</th><th /></tr></thead><tbody>{filteredComplaints.slice(0, 5).map((item) => <tr key={item.id}><td><button className="case-link" onClick={() => showToast(`${item.id} · ${item.title}`)}><b>{item.title}</b><small>{item.id} <span>·</span> {item.location}</small></button></td><td><span className="department-name"><i className={`department-dot dept-${item.department.toLowerCase().replaceAll(' ', '-')}`} />{item.department}</span></td><td><UrgencyPill level={item.urgency} /></td><td><StatusPill>{item.status}</StatusPill></td><td className="reported-time">{item.time}</td><td><button className="row-more" aria-label={`More options for ${item.id}`} onClick={() => showToast(`Actions for ${item.id}`)}><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table>{filteredComplaints.length === 0 && <div className="empty-state">No grievances match that search.</div>}</div><div className="table-footer"><span>Showing <b>{Math.min(filteredComplaints.length, 5)}</b> of <b>{filteredComplaints.length}</b> grievances</span><div><button disabled aria-label="Previous page"><ChevronRight size={14} className="flip" /></button><button className="current-page">1</button><button onClick={() => showToast('You are viewing all available demo records.')}>2</button><button onClick={() => showToast('You are viewing all available demo records.')}>3</button><button onClick={() => showToast('You are viewing all available demo records.')}><ChevronRight size={14} /></button></div></div></section>

              <section className="panel department-panel"><div className="panel-heading"><div><h2>Department workload</h2><p>Distribution of incoming cases</p></div><button className="more-button" aria-label="More department options" onClick={() => showToast('Department workload refreshed.')}>···</button></div><div className="department-chart-wrap"><div className="department-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={departmentData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={73} paddingAngle={4} stroke="none">{departmentData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => [`${value}%`, 'Cases']} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>1,284</strong><span>total cases</span></div></div><div className="department-legend">{departmentData.map((item) => <div key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><b>{item.value}%</b></div>)}</div></div><div className="department-footer"><span><Activity size={14} /> 4 departments active</span><button onClick={() => { setActiveNav('Department teams'); showToast('Opening department team overview.'); }}>Manage teams <ArrowRight size={14} /></button></div></section>
            </div>

            <div className="bottom-note"><span><Sparkles size={15} /></span><p><b>Nirnaya Core insight</b> &nbsp;Water-related grievances are 18% above the weekly average. Consider reviewing Ward 08 pipeline maintenance.</p><button onClick={() => { setActiveNav('AI diagnostics'); showToast('Opening model diagnostics.'); }}>Explore insights <ArrowRight size={14} /></button></div>
          </>}

          {isAdmin && activeNav === 'Budget & Audit' && <BudgetView complaints={complaints} showToast={showToast} />}
          {isAdmin && activeNav === 'AI diagnostics' && <DiagnosticsView />}
          {!isAdmin && activeNav !== 'My complaints' && activeNav !== 'Overview' && <CitizenInfoView activeNav={activeNav} showToast={showToast} onFile={() => setModal('complaint')} />}
          {!isAdmin && (activeNav === 'My complaints' || activeNav === 'Overview') && <CitizenDashboard complaints={complaints.filter((item) => item.citizen === 'You' || item.id.startsWith('NR-2026-08'))} showToast={showToast} onFile={() => setModal('complaint')} />}
          <footer className="page-footer"><span>© 2026 Nirnaya Public Service Intelligence</span><span>Built for a more accountable city <span className="footer-heart">♥</span></span><span><span className="footer-status" /> Secure & encrypted</span></footer>
        </div>
      </main>

      <div className="role-switcher" aria-label="Demo role switcher"><span>DEMO VIEW</span><button className={isAdmin ? 'selected' : ''} onClick={() => switchRole('admin')}><BriefcaseBusiness size={14} /> Executive</button><button className={!isAdmin ? 'selected' : ''} onClick={() => switchRole('citizen')}><Users size={14} /> Citizen</button></div>

      {modal === 'complaint' && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(''); }}><section className="modal-card complaint-modal" role="dialog" aria-modal="true" aria-labelledby="complaint-title"><button className="modal-close" aria-label="Close dialog" onClick={() => setModal('')}><X size={19} /></button><div className="modal-icon"><FilePlus2 size={21} /></div><div className="modal-eyebrow">PUBLIC GRIEVANCE</div><h2 id="complaint-title">Tell us what needs attention</h2><p className="modal-intro">Your concern will be routed to the right team and tracked transparently.</p><form onSubmit={submitComplaint}><label>What’s the issue? <input required maxLength={100} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Water pipe leaking on Main Street" /></label><div className="form-two-col"><label>Category <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Water</option><option>Electricity</option><option>Infrastructure</option><option>Waste Management</option><option>Sanitation</option><option>Public Safety</option></select></label><label>Location <input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Area, ward or landmark" /></label></div><label>Describe the issue <textarea required minLength={10} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Share what happened and when. If anyone is in immediate danger, call emergency services." /></label><div className="ai-note"><Sparkles size={15} /><span><b>Nirnaya Core</b> will categorize your report and assign a priority automatically.</span></div><div className="modal-actions"><button type="button" className="outline-button" onClick={() => setModal('')}>Cancel</button><button type="submit" className="primary-button"><ArrowRight size={16} /> Submit grievance</button></div></form></section></div>}

      {(modal === 'citizen-login' || modal === 'admin-login') && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setModal(''); setOtpStep(false); } }}><section className="modal-card auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="modal-close" aria-label="Close dialog" onClick={() => { setModal(''); setOtpStep(false); }}><X size={19} /></button><Brand compact /><div className="modal-eyebrow">{modal === 'admin-login' ? 'OFFICIAL ACCESS' : 'CITIZEN ACCESS'}</div><h2 id="auth-title">{otpStep ? 'Check your messages' : modal === 'admin-login' ? 'Welcome back, official' : 'Your city, in your hands'}</h2><p className="modal-intro">{otpStep ? 'Enter the 6-digit demo code sent to your contact.' : modal === 'admin-login' ? 'Official sign-in is simulated in this demo.' : 'Sign in or create an account with your mobile number or email.'}</p><form onSubmit={otpStep ? confirmOtp : (event) => { event.preventDefault(); setOtpStep(true); }}><label>{otpStep ? 'Verification code' : modal === 'admin-login' ? 'Official email' : 'Mobile number or email'}<input required value={otpStep ? otp : undefined} onChange={otpStep ? (event) => setOtp(event.target.value) : undefined} placeholder={otpStep ? '123456' : modal === 'admin-login' ? 'name@city.gov.in' : '+91 98765 43210'} inputMode={otpStep ? 'numeric' : 'text'} /></label>{otpStep && <div className="demo-code-note"><ShieldCheck size={15} /> Demo verification code: <b>123456</b></div>}<button type="submit" className="primary-button auth-submit">{otpStep ? 'Verify & continue' : 'Continue'} <ArrowRight size={16} /></button></form><p className="auth-legal">By continuing, you agree to our <button onClick={() => showToast('Terms and privacy information will be available soon.')}>Terms of Service</button> and <button onClick={() => showToast('Terms and privacy information will be available soon.')}>Privacy Policy</button>.</p></section></div>}

      {toast && <div className="toast-message"><span><Check size={15} /></span>{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15} /></button></div>}
    </div>
  );
}

function BudgetView({ complaints, showToast }) {
  const budgeted = complaints.reduce((sum, item) => sum + (item.budget || 0), 0) + 28400000;
  const spent = complaints.reduce((sum, item) => sum + (item.expenditure || 0), 0) + 19200000;
  return <div className="subpage-content"><div className="metric-grid budget-metrics"><article className="metric-card"><div className="metric-top"><span>Total allocated</span><span className="metric-icon icon-green"><IndianRupee size={18} /></span></div><div className="metric-value">₹2.84<span className="metric-unit">Cr</span></div><div className="metric-foot"><span>Across 4 departments</span><span className="metric-period">FY 2026–27</span></div></article><article className="metric-card"><div className="metric-top"><span>Actual expenditure</span><span className="metric-icon icon-blue"><WalletCards size={18} /></span></div><div className="metric-value">₹1.92<span className="metric-unit">Cr</span></div><div className="metric-foot"><span>68% of allocated funds</span><span className="metric-period">On track</span></div></article><article className="metric-card"><div className="metric-top"><span>Audit flags</span><span className="metric-icon icon-red"><AlertTriangle size={18} /></span></div><div className="metric-value">03 <span className="metric-subvalue">require review</span></div><div className="metric-foot"><span className="trend-negative">2 cost anomalies</span><span className="metric-period red-period">Review</span></div></article></div><section className="panel audit-panel"><div className="panel-heading"><div><h2>Flagged transactions</h2><p>Automated checks for duplicate and outlier spending</p></div><button className="outline-button" onClick={() => showToast('Audit report exported in demo mode.')}>Export audit <ArrowDownRight size={14} /></button></div><div className="audit-list"><AuditItem title="Unusual material cost variance" dept="Infrastructure · NR-2026-0813" detail="Reported cost is 38% above the ward benchmark for similar repairs." amount="₹2,48,000" level="Review required" /><AuditItem title="Potential duplicate vendor invoice" dept="Water · NR-2026-0792" detail="Invoice reference matches a transaction logged on 28 Oct 2026." amount="₹84,500" level="High risk" /><AuditItem title="Budget utilization near threshold" dept="Electricity · Ward 14" detail="91% of allocated project funds utilized with work still in progress." amount="₹6,20,000" level="Monitor" /></div></section><section className="panel budget-table-panel"><div className="panel-heading"><div><h2>Department allocation</h2><p>Approved funds compared with actual expenditure</p></div><button className="select-button" onClick={() => showToast('Showing financial year 2026–27.')}>FY 2026–27 <ChevronDown size={14} /></button></div>{[{ name: 'Water', amount: '₹82.0L', used: '₹61.5L', percentage: 75 }, { name: 'Infrastructure', amount: '₹96.0L', used: '₹68.2L', percentage: 71 }, { name: 'Electricity', amount: '₹54.0L', used: '₹36.8L', percentage: 68 }, { name: 'Waste Management', amount: '₹42.0L', used: '₹25.5L', percentage: 61 }].map((row) => <div className="budget-row" key={row.name}><b>{row.name}</b><span>{row.used} <small>of {row.amount}</small></span><div className="budget-row-track"><i style={{ width: `${row.percentage}%` }} /></div><strong>{row.percentage}%</strong></div>)}</section><p className="demo-disclaimer">Illustrative demo data. Audit alerts are simulated indicators and must be reviewed by authorized officials.</p><span className="sr-only">Calculated allocation summary {formatMoney(budgeted)} and expenditure {formatMoney(spent)}</span></div>;
}

function AuditItem({ title, dept, detail, amount, level }) {
  return <article className="audit-item"><span className={`audit-flag ${level === 'High risk' ? 'flag-red' : level === 'Monitor' ? 'flag-amber' : ''}`}><AlertTriangle size={17} /></span><div className="audit-detail"><b>{title}</b><span>{dept}</span><p>{detail}</p></div><div className="audit-amount"><b>{amount}</b><span>{level}</span></div><button className="outline-button audit-review" onClick={(event) => { event.currentTarget.textContent = 'Reviewed'; }}>Review</button></article>;
}

function DiagnosticsView() {
  return <div className="subpage-content"><div className="diagnostics-banner"><span><BrainCircuit size={22} /></span><div><b>Nirnaya Core is operational</b><p>Simulated classifier · Last evaluated 08 Nov 2026 · Validation set: 2,400 reports</p></div><span className="ready-pill"><i /> READY</span></div><div className="metric-grid diagnostics-metrics">{[{ title: 'Accuracy', value: '92.8%', detail: 'Overall classification', icon: Gauge }, { title: 'Precision', value: '89.4%', detail: 'Priority prediction', icon: TargetIcon }, { title: 'Recall', value: '91.2%', detail: 'Issue detection rate', icon: Search }, { title: 'F1 score', value: '90.3%', detail: 'Weighted average', icon: Activity }].map(({ title, value, detail, icon: Icon }) => <article className="metric-card diagnostic-card" key={title}><div className="metric-top"><span>{title}</span><span className="metric-icon icon-green"><Icon size={18} /></span></div><div className="metric-value">{value}</div><div className="metric-foot"><span>{detail}</span><span className="trend-positive"><ArrowUpRight size={14} /> 1.8%</span></div></article>)}</div><div className="dashboard-grid diagnostics-grid"><section className="panel model-panel"><div className="panel-heading"><div><h2>Inference pipeline</h2><p>How a public report becomes an actionable case</p></div></div>{[{ number: '01', title: 'Text normalization', sub: 'Language detection · noise reduction', icon: MessageSquareText }, { number: '02', title: 'Department classification', sub: 'NLP embeddings · 6 service categories', icon: BrainCircuit }, { number: '03', title: 'Urgency scoring', sub: 'Priority level · SLA recommendation', icon: Zap }, { number: '04', title: 'Department routing', sub: 'Lead assignment · citizen tracking', icon: ArrowRight }].map(({ number, title, sub, icon: Icon }) => <div className="pipeline-step" key={number}><span>{number}</span><i><Icon size={16} /></i><div><b>{title}</b><small>{sub}</small></div><Check size={16} className="pipeline-check" /></div>)}</section><section className="panel model-info"><div className="panel-heading"><div><h2>Model readiness</h2><p>Current simulated test harness</p></div></div><div className="readiness-score"><div><b>Production readiness</b><span>Demo only</span></div><div className="readiness-track"><i /></div><p>Model performance is represented by illustrative values. Validate on a representative, consented dataset before operational use.</p></div><div className="model-meta"><span>Classifier version</span><b>nirnaya-core / mock-1.0</b><span>Departments supported</span><b>6 categories</b><span>Urgency classes</span><b>Critical · High · Medium · Low</b></div><button className="outline-button full-button" onClick={() => window.alert('Training pipeline simulator: demo dataset loaded; no real model training is performed.')}>Run evaluation simulator <ArrowRight size={14} /></button></section></div><p className="demo-disclaimer">Performance metrics and readiness indicators are illustrative, not independently validated, production model results.</p></div>;
}

function TargetIcon({ size = 18 }) {
  return <span className="target-icon" style={{ width: size, height: size }}><i /><b /></span>;
}

function CitizenDashboard({ complaints, showToast, onFile }) {
  const myComplaints = complaints;
  const activeCount = myComplaints.filter((item) => item.status !== 'Resolved').length;
  return <div className="citizen-content"><section className="citizen-welcome"><div><span className="citizen-welcome-tag"><ShieldCheck size={14} /> YOUR VOICE MATTERS</span><h2>Small actions make a<br />stronger city.</h2><p>Every report helps make your neighborhood safer, cleaner, and better for everyone.</p><button className="light-primary-button" onClick={onFile}><FilePlus2 size={16} /> Report an issue <ArrowRight size={15} /></button></div><div className="welcome-art" aria-hidden="true"><div className="sun-orb" /><div className="art-cloud cloud-one" /><div className="art-cloud cloud-two" /><div className="city-building building-one" /><div className="city-building building-two" /><div className="city-building building-three" /><div className="city-ground" /><div className="art-tree tree-one" /><div className="art-tree tree-two" /><div className="art-person"><i /><b /></div></div></section><div className="citizen-stat-grid"><article className="citizen-stat"><span className="metric-icon icon-green"><ClipboardList size={18} /></span><div><b>{myComplaints.length}</b><span>Total reports filed</span></div></article><article className="citizen-stat"><span className="metric-icon icon-amber"><Clock3 size={18} /></span><div><b>{activeCount}</b><span>Currently in progress</span></div></article><article className="citizen-stat"><span className="metric-icon icon-blue"><BadgeCheck size={18} /></span><div><b>{myComplaints.filter((item) => item.status === 'Resolved').length}</b><span>Resolved for you</span></div></article><article className="citizen-stat satisfaction-stat"><span className="metric-icon icon-purple"><Sparkles size={18} /></span><div><b>4.8 <small>/ 5</small></b><span>Your impact score</span></div></article></div><section className="panel citizen-reports"><div className="panel-heading"><div><h2>Your recent reports <span className="live-dot" /></h2><p>Live status updates, right here</p></div><button className="text-link" onClick={() => showToast('Showing all your demo reports.')}>View all <ArrowRight size={14} /></button></div>{myComplaints.length ? <div className="citizen-report-list">{myComplaints.slice(0, 5).map((item) => <article className="citizen-report" key={item.id}><div className={`report-category-icon dept-${item.department.toLowerCase().replaceAll(' ', '-')}`}>{item.department === 'Water' ? <Waves size={18} /> : item.department === 'Electricity' ? <Zap size={18} /> : <MapPin size={18} />}</div><div className="report-main"><b>{item.title}</b><span>{item.id} <i /> {item.location || item.department} <i /> {item.time || 'Recently submitted'}</span><div className="citizen-progress"><span className="step-done" /><span className="step-done" /><span className={item.status === 'Work in Progress' || item.status === 'Budget Allotted' ? 'step-done' : ''} /><span className={item.status === 'Resolved' ? 'step-done' : ''} /></div><small className="progress-caption">Submitted <i /> AI reviewed <i /> Assigned <i /> Resolved</small></div><div className="report-state"><StatusPill>{item.status}</StatusPill><UrgencyPill level={item.urgency} /><button onClick={() => showToast(`${item.id}: ${item.status} · ${item.department} department`) }>View details <ArrowRight size={13} /></button></div></article>)}</div> : <div className="citizen-empty"><span><FilePlus2 size={20} /></span><b>No reports yet</b><p>When you report a local issue, you can follow every step here.</p><button className="primary-button" onClick={onFile}>File your first report <ArrowRight size={15} /></button></div>}</section><div className="citizen-info-row"><section className="panel citizen-transparency"><div className="panel-heading"><div><h2>Clear at every step</h2><p>Know what happens after you report</p></div><ShieldCheck size={19} className="transparency-shield" /></div><div className="transparency-steps"><span><i><Check size={13} /></i><b>AI categorizes</b></span><ChevronRight size={13} /><span><i><Check size={13} /></i><b>Team assigned</b></span><ChevronRight size={13} /><span><i><IndianRupee size={13} /></i><b>Budget tracked</b></span><ChevronRight size={13} /><span><i><BadgeCheck size={13} /></i><b>You confirm</b></span></div><p className="transparency-caption">See the budget allocated and spent on every reported issue. Your confirmation helps close the loop.</p></section><section className="panel emergency-card"><span className="emergency-icon"><AlertTriangle size={17} /></span><div><b>Is someone in immediate danger?</b><p>For emergencies, call your local emergency services right away.</p><button onClick={() => showToast('Emergency numbers: 112 (all emergencies), 101 (fire), 100 (police).')}>Emergency numbers <ArrowRight size={13} /></button></div></section></div></div>;
}

function CitizenInfoView({ activeNav, showToast, onFile }) {
  if (activeNav === 'Transparency') return <div className="subpage-content"><section className="panel transparency-page"><div className="panel-heading"><div><h2>Your public transparency record</h2><p>How Nirnaya keeps every grievance accountable</p></div><ShieldCheck size={21} className="transparency-shield" /></div><div className="transparency-steps vertical-steps">{[['Submitted', 'Your report is securely logged and given a unique tracking ID.'], ['AI categorized', 'Nirnaya Core suggests a department and urgency level.'], ['Department assigned', 'A responsible city team receives the case and SLA.'], ['Budget allotted', 'Approved allocation and expenditure are visible to you.'], ['Work in progress', 'Follow updates from the team as work moves forward.'], ['Resolved', 'Confirm the fix or share feedback to close the loop.']].map(([title, detail], index) => <div className="vertical-step" key={title}><i>{index + 1}</i><span><b>{title}</b><small>{detail}</small></span></div>)}</div><button className="primary-button" onClick={onFile}>Start a grievance <ArrowRight size={15} /></button></section></div>;
  return <div className="subpage-content"><section className="panel support-panel"><span className="support-icon"><CircleHelp size={24} /></span><h2>{activeNav}</h2><p>Our citizen support team is ready to help you use Nirnaya and get updates about your local service requests.</p><div className="support-contact"><div><small>PUBLIC HELPLINE</small><b>1800-200-0112</b></div><div><small>SUPPORT HOURS</small><b>Mon–Sat, 8 am–8 pm</b></div></div><button className="primary-button" onClick={() => showToast('A support request has been noted in demo mode.')}>Contact support <ArrowRight size={15} /></button></section></div>;
}
