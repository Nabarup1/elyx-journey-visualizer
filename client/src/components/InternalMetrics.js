import React, { useMemo } from 'react';
import './InternalMetrics.css';

const InternalMetrics = ({ journeyData }) => {
    const totalMetrics = useMemo(() => {
        // The fix is to add "|| 0" to each line in the reducer.
        // This prevents "NaN" if a day is missing an internalMetrics value.
        return journeyData.reduce((acc, day) => {
            acc.doctorHours += day.internalMetrics.doctorHours || 0;
            acc.coachHours += day.internalMetrics.coachHours || 0;
            acc.conciergeHours += day.internalMetrics.conciergeHours || 0;
            return acc;
        }, { doctorHours: 0, coachHours: 0, conciergeHours: 0 });
    }, [journeyData]);

    const totalTeamHours = totalMetrics.doctorHours + totalMetrics.coachHours + totalMetrics.conciergeHours;

    return (
        <div className="metrics-card">
            <h4>Internal Team Metrics (Cumulative)</h4>
            <div className="metrics-grid">
                <div className="metric-item">
                    <span className="metric-value">{totalMetrics.doctorHours.toFixed(2)}</span>
                    <span className="metric-label">Doctor Hours</span>
                </div>
                <div className="metric-item">
                    <span className="metric-value">{totalMetrics.coachHours.toFixed(2)}</span>
                    <span className="metric-label">Coach Hours</span>
                </div>
                <div className="metric-item">
                    <span className="metric-value">{totalMetrics.conciergeHours.toFixed(2)}</span>
                    <span className="metric-label">Concierge Hours</span>
                </div>
                <div className="metric-item total">
                    <span className="metric-value">{totalTeamHours.toFixed(2)}</span>
                    <span className="metric-label">Total Team Hours</span>
                </div>
            </div>
        </div>
    );
};

export default InternalMetrics;