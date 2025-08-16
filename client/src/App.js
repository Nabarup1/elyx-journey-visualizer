import React, { useState, useEffect } from 'react';
import Timeline from './components/Timeline';
import DailyView from './components/DailyView';
import InternalMetrics from './components/InternalMetrics';
import './App.css';

function App() {
  const [journeyData, setJourneyData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJourneyData = async () => {
      try {
        const response = await fetch('/api/journey');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setJourneyData(data.journey);
        if (data.journey && data.journey.length > 0) {
          setSelectedDay(data.journey[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneyData();
  }, []);

  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  if (loading) return <div className="app-container"><h1>Loading Journey...</h1></div>;
  if (error) return <div className="app-container"><h1>Error: {error}</h1></div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <img src="/assets/elyx-logo.png" alt="Elyx Logo" style={{height: '40px'}}/>
        <h1>Rohan Patel's Health Journey</h1>
      </header>
      <main className="app-main">
        <div className="timeline-container">
          <Timeline journeyData={journeyData} onDaySelect={handleDaySelect} selectedDate={selectedDay?.date} />
        </div>
        <div className="details-container">
          {selectedDay && <DailyView day={selectedDay} journeyData={journeyData} />}
          <InternalMetrics journeyData={journeyData} />
        </div>
      </main>
    </div>
  );
}

export default App;