import React, { useState, useMemo } from 'react';
import './DailyView.css';

const DecisionModal = ({ event, message, onClose }) => (
    <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={onClose}>&times;</button>
            <h3>Reason for: "{event.title}"</h3>
            <p><strong>Decision Date:</strong> {new Date(message.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Justification:</strong> This action was taken based on the following communication:</p>
            <div className="modal-message-card">
                <div className="modal-message-header">
                    <strong>{message.sender}</strong>
                    <span>{message.timestamp}</span>
                </div>
                <div className="modal-message-body">
                    {message.text}
                </div>
            </div>
        </div>
    </div>
);


const DailyView = ({ day, journeyData }) => {
    const [modalInfo, setModalInfo] = useState({ isOpen: false, event: null, message: null });

    const messageMap = useMemo(() => {
        const map = new Map();
        journeyData.forEach(d => {
            d.messages.forEach(msg => {
                map.set(msg.id, { ...msg, date: d.date });
            });
        });
        return map;
    }, [journeyData]);

    const handleEventClick = (event) => {
        if (event.triggeredByMessageId) {
            const message = messageMap.get(event.triggeredByMessageId);
            if (message) {
                setModalInfo({ isOpen: true, event, message });
            }
        }
    };

    const closeModal = () => {
        setModalInfo({ isOpen: false, event: null, message: null });
    };

    return (
        <div className="daily-view-card">
            {modalInfo.isOpen && <DecisionModal {...modalInfo} onClose={closeModal} />}
            <div className="daily-header">
                <h2>{day.dayOfWeek}, {new Date(day.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h2>
            </div>

            {day.events.length > 0 && (
                <div className="events-section">
                    <h4>Key Events</h4>
                    {day.events.map((event, index) => (
                        <div key={index} className="event-item" onClick={() => handleEventClick(event)}>
                            <strong>{event.title}</strong>
                            <p>{event.details}</p>
                            {event.triggeredByMessageId && <span className="why-button">Why?</span>}
                        </div>
                    ))}
                </div>
            )}

            <div className="messages-section">
                <h4>Communication Log</h4>
                <div className="message-list">
                    {day.messages.map(msg => (
                        <div key={msg.id} className={`message-bubble ${msg.sender === 'Rohan Patel' ? 'member' : 'elyx'}`}>
                            <div className="message-sender">{msg.sender}</div>
                            <div className="message-text">{msg.text}</div>
                            <div className="message-timestamp">{msg.timestamp}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DailyView;