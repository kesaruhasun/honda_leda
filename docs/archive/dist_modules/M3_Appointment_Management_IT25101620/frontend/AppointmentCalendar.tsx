import React, { useState, useMemo } from 'react';
import { Doctor } from '../../types';

interface AppointmentCalendarProps {
  doctors: Doctor[];
  onConfirm: (doctorId: number | string, date: string, time: string, reason: string) => void;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Mo','Tu','We','Th','Fr','Sa','Su'];
const TIMES = ['09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00'];

// Pseudo-random deterministic function for availability demo
function seedFor(dateStr: string, extra?: string){
  let s = dateStr + '|' + (extra||'');
  let h = 0;
  for(let i=0;i<s.length;i++){ h = (h*31 + s.charCodeAt(i)) >>> 0; }
  return h;
}
function rand(seed: number){ return (seed % 1000) / 1000; }
function dateKey(y: number, m: number, d: number){ return y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }
function isClosed(dateObj: Date){ return dateObj.getDay() === 0; } // Sunday closed
function isPast(dateObj: Date){ 
  const today = new Date();
  today.setHours(0,0,0,0);
  return dateObj < today; 
}
function isDayFull(dateObj: Date){
  if(isClosed(dateObj) || isPast(dateObj)) return false;
  const key = dateKey(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  return rand(seedFor(key,'full')) < 0.16;
}
function slotStatus(dateObj: Date, doctorId: string, time: string){
  const key = dateKey(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const seed = seedFor(key, doctorId+time);
  return rand(seed) < 0.42 ? 'booked' : 'available';
}
function fmtLongDate(dateObj: Date){
  return dateObj.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ doctors, onConfirm }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('any');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const availableDoctors = useMemo(() => {
    return [{ id: 'any', fullName: 'Any Available Doctor' }, ...doctors];
  }, [doctors]);

  const handleNav = (dir: number) => {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setMonth(newMonth);
    setYear(newYear);
  };

  const renderCalendarGrid = () => {
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month+1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`blank-${i}`} className="cal-day blank"></div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const key = dateKey(year, month, d);
      const closed = isClosed(dateObj);
      const past = isPast(dateObj);
      const full = !closed && !past && isDayFull(dateObj);
      const selected = selectedDate === key;
      
      let cls = 'cal-day';
      if(closed) cls += ' closed';
      if(past) cls += ' past';
      if(full) cls += ' full';
      if(selected) cls += ' selected';

      const showFlag = !closed && !past;

      cells.push(
        <button 
          key={key} 
          type="button"
          className={cls} 
          disabled={closed || past}
          onClick={() => {
            if (closed || past) return;
            setSelectedDate(key);
            setSelectedTime(null);
          }}
        >
          <span className="cal-day-num">{d}</span>
          {showFlag && <span className="flag"></span>}
        </button>
      );
    }
    return cells;
  };

  const renderSidePanel = () => {
    if (!selectedDate) {
      return (
        <div className="cal-empty-state">
          <div className="empty-icon">📅</div>
          <div className="date-title">Select a Date</div>
          <p className="empty-note">
            Choose any available date on the calendar to view consultant doctors and open consultation time slots.
          </p>
        </div>
      );
    }

    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m-1, d);
    const closed = isClosed(dateObj);

    if (closed) {
      return (
        <div className="cal-empty-state">
          <div className="empty-icon">🏥</div>
          <div className="date-title">{fmtLongDate(dateObj)}</div>
          <div className="empty-note text-rose-600">
            <b>Clinic Closed on Sundays.</b> Please select a weekday or Saturday for outpatient consultations.
          </div>
        </div>
      );
    }

    const availableCount = TIMES.filter(t => slotStatus(dateObj, selectedDoctor, t) === 'available').length;

    return (
      <div className="cal-side-content">
        <div className="side-header">
          <div className="date-title">{fmtLongDate(dateObj)}</div>
          <div className="date-count">
            <span className="status-dot"></span>
            {availableCount} of {TIMES.length} consultation slots open
          </div>
        </div>

        <div className="section-block">
          <label className="field-label">Consultant Physician</label>
          <div className="doctor-row custom-scrollbar">
            {availableDoctors.map(doc => (
              <button 
                key={doc.id} 
                type="button"
                className={`chip ${selectedDoctor === doc.id.toString() ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDoctor(doc.id.toString());
                  setSelectedTime(null);
                }}
              >
                {doc.fullName}
              </button>
            ))}
          </div>
        </div>

        <div className="section-block">
          <label className="field-label">Preferred Time Slot</label>
          {availableCount === 0 ? (
            <div className="empty-note text-amber-700">
              <b>Fully Booked.</b> All slots for this selection are taken. Please pick another doctor or date.
            </div>
          ) : (
            <div className="slot-grid">
              {TIMES.map(t => {
                const status = slotStatus(dateObj, selectedDoctor, t);
                const selected = selectedTime === t;
                const isBooked = status === 'booked';
                
                return (
                  <button 
                    key={t}
                    type="button"
                    disabled={isBooked}
                    className={`slot ${isBooked ? 'booked' : ''} ${selected ? 'selected' : ''}`}
                    onClick={() => {
                      if (isBooked) return;
                      setSelectedTime(t);
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="summary-card">
          <div className="summary-row">
            <span>Physician</span>
            <span className="summary-val">{availableDoctors.find(x => x.id.toString() === selectedDoctor)?.fullName}</span>
          </div>
          <div className="summary-row">
            <span>Consultation Date</span>
            <span className="summary-val">{fmtLongDate(dateObj)}</span>
          </div>
          <div className="summary-row">
            <span>Selected Time</span>
            <span className="summary-val font-mono">{selectedTime || 'Please select a slot'}</span>
          </div>
          
          <div className="mt-3">
            <label className="field-label !mt-0 !mb-1">Reason for Consultation</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g. Regular medical checkup, fever, prescription renewal..."
              className="reason-input"
              rows={2}
            />
          </div>

          <button 
            type="button"
            className="confirm-btn" 
            disabled={!selectedTime}
            onClick={() => {
              if (selectedTime) {
                const finalDocId = selectedDoctor === 'any' && doctors.length > 0 ? doctors[0].id : selectedDoctor;
                onConfirm(finalDocId, selectedDate, selectedTime, reason || 'Outpatient Consultation');
              }
            }}
          >
            {selectedTime ? `Confirm Consultation for ${selectedTime}` : 'Select an Available Slot Above'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-widget-container">
      <style>{`
        .calendar-widget-container {
          --bg: #F8FAFC;
          --panel: #FFFFFF;
          --ink: #0F172A;
          --ink-soft: #475569;
          --teal: #0D9488;
          --teal-hover: #0F766E;
          --teal-pale: #F0FDFA;
          --teal-border: #99F6E4;
          --coral: #E11D48;
          --coral-pale: #FFF1F2;
          --line: #E2E8F0;
          --muted: #F1F5F9;
          --muted-ink: #94A3B8;
          font-family: inherit;
          color: var(--ink);
          width: 100%;
        }

        .cal-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(16px, 2.5vw, 28px);
          align-items: start;
          width: 100%;
        }

        @media (min-width: 960px) {
          .cal-layout {
            grid-template-columns: 1.15fr 1fr;
          }
        }
        
        .cal-panel {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: clamp(16px, 2.5vw, 24px);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          width: 100%;
        }
        
        .cal-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .cal-month {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--ink);
          letter-spacing: -0.01em;
        }

        .cal-nav {
          display: flex;
          gap: 8px;
        }

        .cal-nav button {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: var(--panel);
          color: var(--ink);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          transition: all 0.15s ease;
        }

        .cal-nav button:hover {
          background: var(--muted);
          border-color: #CBD5E1;
        }

        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .cal-dow {
          font-size: 12px;
          color: var(--muted-ink);
          text-align: center;
          padding-bottom: 8px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .cal-day {
          position: relative;
          min-height: 44px;
          aspect-ratio: 1;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          background: transparent;
          transition: all 0.15s ease;
        }

        .cal-day.blank {
          visibility: hidden;
          cursor: default;
        }

        .cal-day.closed, .cal-day.past {
          color: var(--muted-ink);
          cursor: not-allowed;
          opacity: 0.45;
        }

        .cal-day.full {
          color: var(--coral);
          background: var(--coral-pale);
        }

        .cal-day:not(.blank):not(.past):not(.closed):hover {
          background: var(--muted);
          transform: scale(1.04);
        }

        .cal-day.selected {
          background: var(--teal) !important;
          color: #FFFFFF !important;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35);
          transform: scale(1.05);
        }

        .cal-day .flag {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          margin-top: 3px;
          background: var(--teal);
        }

        .cal-day.full .flag {
          background: var(--coral);
        }

        .cal-day.selected .flag {
          background: #FFFFFF;
        }
        
        .legend {
          display: flex;
          gap: 16px;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid var(--line);
          flex-wrap: wrap;
          font-size: 12px;
          color: var(--ink-soft);
        }

        .legend span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .legend i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .cal-side-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cal-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          min-height: 320px;
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }
        
        .date-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--ink);
          margin: 0;
        }

        .date-count {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--teal-hover);
          font-weight: 600;
          margin-top: 4px;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--teal);
          display: inline-block;
        }

        .section-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted-ink);
          font-weight: 700;
        }
        
        .doctor-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-height: 120px;
          overflow-y: auto;
          padding-bottom: 2px;
        }

        .chip {
          font-size: 12.5px;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 9999px;
          border: 1px solid var(--line);
          background: var(--muted);
          cursor: pointer;
          color: var(--ink-soft);
          transition: all 0.15s ease;
        }

        .chip:hover {
          border-color: var(--teal);
          color: var(--teal);
          background: #FFFFFF;
        }

        .chip.active {
          background: var(--teal);
          border-color: var(--teal);
          color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25);
        }
        
        .slot-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
          gap: 8px;
        }

        .slot {
          font-size: 13px;
          font-weight: 600;
          padding: 10px 8px;
          text-align: center;
          border-radius: 10px;
          border: 1px solid var(--teal-border);
          color: var(--teal-hover);
          background: var(--teal-pale);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .slot:hover:not(.booked) {
          background: #CCFBF1;
          border-color: var(--teal);
          transform: translateY(-1px);
        }

        .slot.booked {
          border-color: var(--line);
          background: var(--muted);
          color: var(--muted-ink);
          text-decoration: line-through;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .slot.selected {
          background: var(--teal) !important;
          border-color: var(--teal) !important;
          color: #FFFFFF !important;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(13, 148, 136, 0.3);
        }
        
        .empty-note {
          font-size: 13px;
          color: var(--ink-soft);
          background: var(--muted);
          border-radius: 12px;
          padding: 14px 16px;
          line-height: 1.5;
        }
        
        .summary-card {
          margin-top: 10px;
          background: var(--muted);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 14px 16px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12.5px;
          padding: 5px 0;
          color: var(--ink-soft);
        }

        .summary-val {
          color: var(--ink);
          font-weight: 700;
          text-align: right;
        }

        .reason-input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: #FFFFFF;
          color: var(--ink);
          font-size: 13px;
          font-family: inherit;
          resize: none;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .reason-input:focus {
          border-color: var(--teal);
          box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.15);
        }
        
        .confirm-btn {
          width: 100%;
          margin-top: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          background: var(--teal);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(13, 148, 136, 0.25);
          transition: all 0.15s ease;
        }

        .confirm-btn:hover:not(:disabled) {
          background: var(--teal-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35);
        }

        .confirm-btn:disabled {
          background: var(--line);
          color: var(--muted-ink);
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>

      <div className="cal-layout">
        <div className="cal-panel">
          <div className="cal-head">
            <div className="cal-month">{MONTH_NAMES[month]} {year}</div>
            <div className="cal-nav">
              <button type="button" onClick={() => handleNav(-1)} aria-label="Previous month">&#8249;</button>
              <button type="button" onClick={() => handleNav(1)} aria-label="Next month">&#8250;</button>
            </div>
          </div>
          <div className="cal-grid">
            {DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
            {renderCalendarGrid()}
          </div>
          <div className="legend">
            <span><i style={{background: 'var(--teal)'}}></i>Available</span>
            <span><i style={{background: 'var(--coral)'}}></i>Full</span>
            <span><i style={{background: 'var(--muted-ink)'}}></i>Closed/Past</span>
          </div>
        </div>
        
        <div className="cal-panel">
          {renderSidePanel()}
        </div>
      </div>
    </div>
  );
};
