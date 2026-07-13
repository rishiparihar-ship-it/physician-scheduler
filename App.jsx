import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Settings, BarChart3, Calendar, Users, Send, Download, LogOut } from 'lucide-react';

const PhysicianScheduler = () => {
  const [mode, setMode] = useState('admin');
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1));
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [physicians, setPhysicians] = useState([
    { id: 1, name: 'Dr. Smith', minHours: 40, maxHours: 80, specialty: 'Full-time', password: 'smith123' },
    { id: 2, name: 'Dr. Johnson', minHours: 20, maxHours: 60, specialty: 'Part-time', password: 'johnson123' },
    { id: 3, name: 'Dr. Patel', minHours: 30, maxHours: 70, specialty: 'Full-time', password: 'patel123' },
  ]);
  const [schedule, setSchedule] = useState({});
  const [rules, setRules] = useState([
    'Respect physician availability selections',
    'Prioritize full-day assignments (7am-5pm)',
    'Secondary: split shifts (7am-12pm, 12pm-5pm)',
    'Tertiary: 8am-4pm with 7-8am and 4-5pm buffers'
  ]);
  const [newRule, setNewRule] = useState('');
  const [selectedPhysician, setSelectedPhysician] = useState(null);
  const [showPhysicianForm, setShowPhysicianForm] = useState(false);
  const [newPhysician, setNewPhysician] = useState({ name: '', minHours: 40, maxHours: 80, specialty: '' });
  const [showScheduleDetail, setShowScheduleDetail] = useState(null);
  const [tradeRequests, setTradeRequests] = useState([]);
  const [scheduleStatus, setScheduleStatus] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [holidays, setHolidays] = useState([]);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  const [clinicSettings, setClinicSettings] = useState({
    clinicName: 'Simcoe Hyperbarics',
    clinicEmail: 'admin@simcoehyperbarics.com',
    clinicPhone: '(705) 123-4567',
    clinicAddress: '123 Medical Drive, Barrie, ON',
    workWeekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    clinicStartTime: '7:00 AM',
    clinicEndTime: '5:00 PM',
    maxPhysiciansPerDay: 2,
    minDaysOff: 1,
    allowWeekendScheduling: false,
    theme: 'light',
    notificationFrequency: 'weekly',
    autoScheduleStrategy: 'fairness'
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const physician = physicians.find(p => 
      p.name.toLowerCase() === loginEmail.toLowerCase() && p.password === loginPassword
    );
    if (physician) {
      const userData = { id: physician.id, name: physician.name };
      setLoggedInUser(userData);
      setLoginEmail('');
      setLoginPassword('');
      setMode('physician');
    } else {
      setLoginError('Invalid name or password. Try "Dr. Smith" / "smith123"');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setLoginEmail('');
    setLoginPassword('');
  };

  useEffect(() => {
    localStorage.setItem('physicianSchedule', JSON.stringify({ physicians, schedule, rules, holidays }));
  }, [physicians, schedule, rules, holidays]);

  const isHoliday = (year, month, day) => {
    return holidays.some(h => {
      const hDate = new Date(h.date);
      return hDate.getFullYear() === year && hDate.getMonth() === month && hDate.getDate() === day;
    });
  };

  const getHolidayName = (year, month, day) => {
    const holiday = holidays.find(h => {
      const hDate = new Date(h.date);
      return hDate.getFullYear() === year && hDate.getMonth() === month && hDate.getDate() === day;
    });
    return holiday ? holiday.name : null;
  };

  const handleAddHoliday = () => {
    if (holidayDate && holidayName) {
      const newDate = new Date(holidayDate);
      setHolidays([...holidays, { date: newDate.toISOString(), name: holidayName }]);
      setHolidayDate('');
      setHolidayName('');
      setShowHolidayForm(false);
    }
  };

  const deleteHoliday = (index) => {
    setHolidays(holidays.filter((_, i) => i !== index));
  };

  const handleSaveSettings = () => {
    alert('✓ Settings saved successfully!');
    setShowAdminSettings(false);
  };

  const handleExportData = () => {
    const allData = {
      physicians,
      schedule,
      rules,
      holidays,
      clinicSettings,
      exportDate: new Date().toISOString()
    };
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2)));
    element.setAttribute('download', `Clinic_Data_Backup_${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    alert('✓ Data exported successfully!');
  };

  const handleExportPDF = () => {
    let html = `<html><head><style>body { font-family: Arial, sans-serif; margin: 20px; } h1 { color: #333; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #667eea; color: white; }</style></head><body>`;
    html += `<h1>${clinicSettings.clinicName} - Schedule</h1>`;
    html += `<p>Month: ${currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>`;
    html += `<table><tr><th>Date</th><th>Physicians</th><th>Status</th></tr>`;
    
    for (let day = 1; day <= 31; day++) {
      const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`;
      const shifts = schedule[key] || [];
      if (shifts.length === 0 && !isHoliday(currentMonth.getFullYear(), currentMonth.getMonth(), day)) continue;
      
      const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString();
      const holiday = getHolidayName(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const physicians_str = holiday ? `🏢 ${holiday}` : shifts.map(s => physicians.find(p => p.id === s.physicianId)?.name || 'Unknown').join(', ') || 'Unassigned';
      
      html += `<tr><td>${dateStr}</td><td>${physicians_str}</td><td>${holiday ? 'Closed' : 'Open'}</td></tr>`;
    }
    html += `</table></body></html>`;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(html));
    element.setAttribute('download', `Schedule_${currentMonth.getFullYear()}_${currentMonth.getMonth() + 1}.html`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    alert('✓ Schedule exported as PDF-ready HTML!');
  };

  const handleExportICAL = () => {
    let ical = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Hyperbaric Clinic//Physician Schedule//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:${clinicSettings.clinicName}\nX-WR-TIMEZONE:America/Toronto\nBEGIN:VTIMEZONE\nTZID:America/Toronto\nBEGIN:STANDARD\nTZOFFSETFROM:-0400\nTZOFFSETTO:-0500\nTZNAME:EST\nDTSTART:20231105T020000\nRRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\nEND:STANDARD\nBEGIN:DAYLIGHT\nTZOFFSETFROM:-0500\nTZOFFSETTO:-0400\nTZNAME:EDT\nDTSTART:20230312T020000\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\nEND:DAYLIGHT\nEND:VTIMEZONE\n`;

    Object.entries(schedule).forEach(([key, shifts]) => {
      const [year, month, day] = key.split('-');
      shifts.forEach((shift) => {
        const physician = physicians.find(p => p.id === shift.physicianId);
        if (!physician) return;
        const startTime = shift.shift === 'full' || shift.shift === 'morning' ? '0700' : '1200';
        const endTime = shift.shift === 'full' ? '1700' : shift.shift === 'morning' ? '1200' : '1700';
        const dtStart = `${year}${String(parseInt(month) + 1).padStart(2, '0')}${String(day).padStart(2, '0')}T${startTime}00`;
        const dtEnd = `${year}${String(parseInt(month) + 1).padStart(2, '0')}${String(day).padStart(2, '0')}T${endTime}00`;
        const uid = `${dtStart}-${physician.id}@clinic.com`;
        ical += `BEGIN:VEVENT\nUID:${uid}\nDTSTART;TZID=America/Toronto:${dtStart}\nDTEND;TZID=America/Toronto:${dtEnd}\nSUMMARY:${physician.name} - ${shift.shift === 'full' ? 'Full Day' : shift.shift === 'morning' ? 'Morning' : 'Afternoon'}\nLOCATION:${clinicSettings.clinicName}\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
      });
    });

    holidays.forEach(holiday => {
      const hDate = new Date(holiday.date);
      const dateStr = `${hDate.getFullYear()}${String(hDate.getMonth() + 1).padStart(2, '0')}${String(hDate.getDate()).padStart(2, '0')}`;
      ical += `BEGIN:VEVENT\nUID:holiday-${dateStr}@clinic.com\nDTSTART;VALUE=DATE:${dateStr}\nDTEND;VALUE=DATE:${String(parseInt(dateStr) + 1).padStart(8, '0')}\nSUMMARY:🏢 ${holiday.name} - CLINIC CLOSED\nSTATUS:CONFIRMED\nEND:VEVENT\n`;
    });

    ical += `END:VCALENDAR`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ical));
    element.setAttribute('download', `Clinic_Schedule_${currentMonth.getFullYear()}_${currentMonth.getMonth() + 1}.ics`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    alert('✓ Schedule exported to iCal format!');
  };

  const addPhysician = () => {
    if (newPhysician.name) {
      const newDoc = {
        id: Math.max(...physicians.map(p => p.id), 0) + 1,
        name: newPhysician.name,
        minHours: newPhysician.minHours,
        maxHours: newPhysician.maxHours,
        specialty: newPhysician.specialty,
        password: newPhysician.name.toLowerCase().replace(/\s/g, '') + '123'
      };
      setPhysicians([...physicians, newDoc]);
      setNewPhysician({ name: '', minHours: 40, maxHours: 80, specialty: '' });
      setShowPhysicianForm(false);
    }
  };

  const assignPhysician = (day, physicianId, shift = 'full') => {
    const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`;
    const current = schedule[key] || [];
    if (current.find(s => s.physicianId === physicianId)) return;
    setSchedule({
      ...schedule,
      [key]: [...current, { physicianId, shift, date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString() }]
    });
  };

  const removeAssignment = (day, physicianId) => {
    const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`;
    setSchedule({
      ...schedule,
      [key]: (schedule[key] || []).filter(s => s.physicianId !== physicianId)
    });
  };

  const getPhysicianName = (id) => physicians.find(p => p.id === id)?.name || 'Unknown';

  const getPhysicianHours = (physicianId) => {
    let hours = 0;
    Object.keys(schedule).forEach(key => {
      const [year, month, day] = key.split('-');
      if (parseInt(month) === currentMonth.getMonth() && parseInt(year) === currentMonth.getFullYear()) {
        schedule[key].forEach(s => {
          if (s.physicianId === physicianId) {
            hours += s.shift === 'full' ? 10 : 5;
          }
        });
      }
    });
    return hours;
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  if (mode === 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <nav style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '1rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600' }}>📋 Admin Dashboard</h1>
            <div style={{ display: 'flex', gap: '8px' }}>
              {loggedInUser && (
                <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: '#d32f2f', display: 'flex', gap: '4px', alignItems: 'center' }}><LogOut size={14} /> Logout</button>
              )}
              {!loggedInUser && (
                <button onClick={() => setMode('login')} style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}>Login</button>
              )}
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleExportPDF} style={{ padding: '10px 20px', background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '14px', fontWeight: '500', display: 'flex', gap: '6px', alignItems: 'center' }}><Download size={16} /> Export PDF</button>
            <button onClick={handleExportICAL} style={{ padding: '10px 20px', background: '#9C27B0', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '14px', fontWeight: '500', display: 'flex', gap: '6px', alignItems: 'center' }}><Calendar size={16} /> iCal Export</button>
            <button onClick={() => setShowAdminSettings(true)} style={{ padding: '10px 20px', background: '#673AB7', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '14px', fontWeight: '500', display: 'flex', gap: '6px', alignItems: 'center' }}><Settings size={16} /> Admin Settings</button>
            {scheduleStatus && <span style={{ fontSize: '13px', color: scheduleStatus.includes('Error') ? '#d32f2f' : '#4CAF50' }}>{scheduleStatus}</span>}
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={{ padding: '8px 12px', background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '4px' }}><ChevronLeft size={20} /></button>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={{ padding: '8px 12px', background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '4px' }}><ChevronRight size={20} /></button>
            </div>
          </div>

          {showAdminSettings && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
                <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '20px', fontWeight: '600' }}>⚙️ Admin Settings</h2>
                
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
                  <button onClick={() => setSettingsTab('general')} style={{ padding: '10px 16px', background: settingsTab === 'general' ? '#667eea' : 'transparent', color: settingsTab === 'general' ? '#fff' : '#666', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>General</button>
                  <button onClick={() => setSettingsTab('scheduling')} style={{ padding: '10px 16px', background: settingsTab === 'scheduling' ? '#667eea' : 'transparent', color: settingsTab === 'scheduling' ? '#fff' : '#666', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>Scheduling</button>
                  <button onClick={() => setSettingsTab('backup')} style={{ padding: '10px 16px', background: settingsTab === 'backup' ? '#667eea' : 'transparent', color: settingsTab === 'backup' ? '#fff' : '#666', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>Backup</button>
                </div>

                {settingsTab === 'general' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Clinic Name</label>
                      <input type="text" value={clinicSettings.clinicName} onChange={(e) => setClinicSettings({...clinicSettings, clinicName: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Admin Email</label>
                      <input type="email" value={clinicSettings.clinicEmail} onChange={(e) => setClinicSettings({...clinicSettings, clinicEmail: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Phone</label>
                      <input type="tel" value={clinicSettings.clinicPhone} onChange={(e) => setClinicSettings({...clinicSettings, clinicPhone: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Address</label>
                      <input type="text" value={clinicSettings.clinicAddress} onChange={(e) => setClinicSettings({...clinicSettings, clinicAddress: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}

                {settingsTab === 'scheduling' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Start Time</label>
                        <input type="text" value={clinicSettings.clinicStartTime} onChange={(e) => setClinicSettings({...clinicSettings, clinicStartTime: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>End Time</label>
                        <input type="text" value={clinicSettings.clinicEndTime} onChange={(e) => setClinicSettings({...clinicSettings, clinicEndTime: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Max Physicians Per Day</label>
                      <input type="number" value={clinicSettings.maxPhysiciansPerDay} onChange={(e) => setClinicSettings({...clinicSettings, maxPhysiciansPerDay: parseInt(e.target.value)})} min="1" max="10" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Min Days Off Per Month</label>
                      <input type="number" value={clinicSettings.minDaysOff} onChange={(e) => setClinicSettings({...clinicSettings, minDaysOff: parseInt(e.target.value)})} min="0" max="15" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                )}

                {settingsTab === 'backup' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '14px', fontWeight: '600' }}>Export Data</h4>
                      <button onClick={handleExportData} style={{ width: '100%', padding: '12px', background: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}>📥 Download All Data as JSON</button>
                      <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0' }}>Creates backup: Clinic_Data_Backup_YYYY-MM-DD.json</p>
                    </div>
                    <div style={{ padding: '12px', background: '#E3F2FD', borderRadius: '6px', fontSize: '12px', color: '#1565C0' }}>
                      <strong>💾 Current Data:</strong><br/>
                      Physicians: {physicians.length}<br/>
                      Scheduled Days: {Object.keys(schedule).length}<br/>
                      Rules: {rules.length}<br/>
                      Holidays: {holidays.length}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSaveSettings} style={{ flex: 1, padding: '12px', background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}>✓ Save Settings</button>
                  <button onClick={() => setShowAdminSettings(false)} style={{ flex: 1, padding: '12px', background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}>Close</button>
                </div>
              </div>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>👨‍⚕️ Physicians</h3>
              <button onClick={() => setShowPhysicianForm(true)} style={{ padding: '8px 16px', background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' }}><Plus size={16} /> Add</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {physicians.map(p => (
                <div key={p.id} style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '6px', borderLeft: '4px solid #667eea' }}>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {p.minHours}-{p.maxHours} hrs/month<br/>
                    {p.specialty}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
                    Password: {p.password}
                  </div>
                </div>
              ))}
            </div>

            {showPhysicianForm && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#E8F5E9', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '13px', fontWeight: '600' }}>Add New Physician</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" value={newPhysician.name} onChange={(e) => setNewPhysician({...newPhysician, name: e.target.value})} placeholder="Name" style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                  <input type="number" value={newPhysician.minHours} onChange={(e) => setNewPhysician({...newPhysician, minHours: parseInt(e.target.value)})} placeholder="Min Hours" style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                  <input type="number" value={newPhysician.maxHours} onChange={(e) => setNewPhysician({...newPhysician, maxHours: parseInt(e.target.value)})} placeholder="Max Hours" style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                  <input type="text" value={newPhysician.specialty} onChange={(e) => setNewPhysician({...newPhysician, specialty: e.target.value})} placeholder="Specialty" style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={addPhysician} style={{ flex: 1, padding: '8px', background: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>Add</button>
                    <button onClick={() => setShowPhysicianForm(false)} style={{ flex: 1, padding: '8px', background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>🏢 Holidays & Closures</h3>
              <button onClick={() => setShowHolidayForm(true)} style={{ padding: '8px 16px', background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', display: 'flex', gap: '6px', alignItems: 'center' }}><Plus size={16} /> Add</button>
            </div>
            {showHolidayForm && (
              <div style={{ padding: '1rem', background: '#FFF3E0', borderRadius: '6px', marginBottom: '1rem', display: 'flex', gap: '8px' }}>
                <input type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                <input type="text" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} placeholder="Holiday name" style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '12px', boxSizing: 'border-box' }} />
                <button onClick={handleAddHoliday} style={{ padding: '8px 12px', background: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>Add</button>
                <button onClick={() => setShowHolidayForm(false)} style={{ padding: '8px 12px', background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>Cancel</button>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              {holidays.map((h, idx) => (
                <div key={idx} style={{ padding: '10px', background: '#FFE0B2', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: '500', color: '#E65100' }}>{h.name}</div>
                    <div style={{ fontSize: '11px', color: '#E65100' }}>{new Date(h.date).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => deleteHoliday(idx)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', border: '1px solid #e0e0e0' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: '600' }}>📅 Monthly Schedule</h3>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minWidth: '600px' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ padding: '10px', background: '#f5f5f5', fontWeight: '600', textAlign: 'center', fontSize: '13px' }}>{day}</div>
                ))}
                {[...Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay())].map((_, i) => (
                  <div key={`empty-${i}`}></div>
                ))}
                {[...Array(getDaysInMonth(currentMonth))].map((_, i) => {
                  const day = i + 1;
                  const key = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`;
                  const daySchedule = schedule[key] || [];
                  const holiday = getHolidayName(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  return (
                    <div key={day} style={{ padding: '8px', border: '1px solid #e0e0e0', borderRadius: '6px', background: holiday ? '#FFE0B2' : '#fff', minHeight: '80px', fontSize: '11px' }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px', color: holiday ? '#E65100' : '#333' }}>{day}</div>
                      {holiday && <div style={{ fontSize: '10px', color: '#E65100', fontWeight: '500' }}>🏢 {holiday}</div>}
                      {daySchedule.map((shift, idx) => (
                        <div key={idx} style={{ padding: '2px', background: '#E3F2FD', borderRadius: '3px', marginBottom: '2px', color: '#1565C0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', paddingRight: '2px' }}>
                          <span>{getPhysicianName(shift.physicianId).split(' ')[1]}</span>
                          <button onClick={() => removeAssignment(day, shift.physicianId)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', padding: 0, fontSize: '10px' }}>✕</button>
                        </div>
                      ))}
                      {!holiday && daySchedule.length < clinicSettings.maxPhysiciansPerDay && (
                        <select onChange={(e) => {
                          if (e.target.value) {
                            assignPhysician(day, parseInt(e.target.value), 'full');
                            e.target.value = '';
                          }
                        }} style={{ width: '100%', fontSize: '10px', padding: '2px', marginTop: '2px', boxSizing: 'border-box' }}>
                          <option value="">+ Assign</option>
                          {physicians.map(p => (
                            <option key={p.id} value={p.id} disabled={daySchedule.find(s => s.physicianId === p.id)}>{p.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', marginTop: '1.5rem', border: '1px solid #e0e0e0' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '16px', fontWeight: '600' }}>📊 Monthly Hours</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {physicians.map(p => {
                const hours = getPhysicianHours(p.id);
                const percent = ((hours - p.minHours) / (p.maxHours - p.minHours)) * 100;
                return (
                  <div key={p.id} style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '6px' }}>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{hours} / {p.minHours}-{p.maxHours} hrs</div>
                    <div style={{ height: '6px', background: '#ddd', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: hours < p.minHours ? '#FF9800' : hours > p.maxHours ? '#f44336' : '#4CAF50', width: Math.min(100, Math.max(0, percent)) + '%' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loggedInUser) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '3rem', maxWidth: '400px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <h1 style={{ margin: '0 0 1rem 0', fontSize: '24px', fontWeight: '600', textAlign: 'center' }}>Physician Scheduler</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Physician Name</label>
              <input type="text" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="e.g., Dr. Smith" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Password</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            {loginError && <div style={{ padding: '12px', background: '#FFEBEE', color: '#C62828', borderRadius: '6px', fontSize: '13px' }}>{loginError}</div>}
            <button type="submit" style={{ padding: '12px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500', cursor: 'pointer' }}>Sign In</button>
          </form>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#F5F5F5', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
            <p style={{ margin: '0 0 6px 0', fontWeight: '500' }}>Demo Credentials:</p>
            <p style={{ margin: '2px 0' }}>Dr. Smith / smith123</p>
            <p style={{ margin: '2px 0' }}>Dr. Johnson / johnson123</p>
            <p style={{ margin: '2px 0' }}>Dr. Patel / patel123</p>
          </div>
          <button onClick={() => setMode('admin')} style={{ width: '100%', marginTop: '1rem', padding: '10px', background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>→ Admin Dashboard (No Login)</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <nav style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Your Schedule</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>Welcome, {loggedInUser.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setMode('admin')} style={{ padding: '8px 16px', background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' }}>Admin Dashboard</button>
            <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', color: '#d32f2f' }}>Logout</button>
          </div>
        </div>
      </nav>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', border: '1px solid #e0e0e0' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Your Assigned Shifts</h3>
            {Object.values(schedule).flat().filter(s => s.physicianId === loggedInUser.id).length === 0 ? (
              <p style={{ color: '#999' }}>No shifts assigned yet.</p>
            ) : (
              Object.entries(schedule).map(([key, shifts]) => shifts.filter(s => s.physicianId === loggedInUser.id).map((shift, idx) => (
                <div key={idx} style={{ padding: '12px', background: '#E3F2FD', borderRadius: '6px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: '500' }}>{new Date(shift.date).toLocaleDateString()}</div>
                  <div style={{ fontSize: '13px', color: '#666' }}>{shift.shift === 'full' ? '7am-5pm (10h)' : shift.shift === 'morning' ? '7am-12pm (5h)' : '12pm-5pm (5h)'}</div>
                </div>
              )))
            )}
          </div>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem', border: '1px solid #e0e0e0' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Mark Your Availability</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {[...Array(getDaysInMonth(currentMonth))].map((_, i) => {
                const day = i + 1;
                const key = `avail-${loggedInUser.id}-${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`;
                const isAvailable = typeof window !== 'undefined' && localStorage.getItem(key) === 'true';
                return (
                  <button key={day} onClick={() => {
                    typeof window !== 'undefined' && localStorage.setItem(key, !isAvailable);
                  }} style={{ padding: '10px', borderRadius: '6px', border: isAvailable ? '2px solid #4CAF50' : '1px solid #ddd', background: isAvailable ? '#E8F5E9' : '#fff', fontWeight: '500', cursor: 'pointer', fontSize: '12px' }}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicianScheduler;
