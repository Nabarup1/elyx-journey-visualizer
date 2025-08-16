import React from 'react';
import './Timeline.css';

const getEventTypeIcon = (type) => {
    switch (type) {
        case 'ONBOARDING': return '🚀';
        case 'DIAGNOSTIC': return '🔬';
        case 'INTERVENTION_START': return '💊';
        case 'EXERCISE_UPDATE': return '🏋️';
        case 'TRAVEL': return '✈️';
        case 'FRICTION': return '⚠️';
        default: return '➡️';
    }
};

const Timeline = ({ journeyData, onDaySelect, selectedDate }) => {
    const groupedByMonth = journeyData.reduce((acc, day) => {
        const month = day.month;
        if (!acc[month]) {
            acc[month] = [];
        }
        acc[month].push(day);
        return acc;
    }, {});

    return (
        <div className="timeline-wrapper">
            <h2>Journey Timeline</h2>
            {Object.keys(groupedByMonth).map(month => (
                <div key={month} className="month-group">
                    <h3>{month} 2025</h3>
                    {groupedByMonth[month].map(day => (
                        <div
                            key={day.date}
                            className={`timeline-item ${day.date === selectedDate ? 'selected' : ''}`}
                            onClick={() => onDaySelect(day)}
                        >
                            <div className="timeline-date">{new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                            <div className="timeline-content">
                                <p className="timeline-summary">{day.summary}</p>
                                <div className="event-icons">
                                    {day.events.map((event, index) => (
                                        <span key={index} title={event.title} className="event-icon">{getEventTypeIcon(event.type)}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Timeline;