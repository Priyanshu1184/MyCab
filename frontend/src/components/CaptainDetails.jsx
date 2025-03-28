import React, { useContext } from 'react';
import { CaptainDataContext } from '../context/CapatainContext';
import 'remixicon/fonts/remixicon.css';
import './CaptainDetails.css'; // Import the CSS file

const CaptainDetails = () => {
    const { captain } = useContext(CaptainDataContext);

    return (
        <div className="captain-details">
            <div className="captain-header">
                {/* Left: Captain's Photo */}
                <div className="captain-info">
                    <img
                        className="captain-img"
                        src="https://cdn.pixabay.com/photo/2023/05/27/08/04/ai-generated-8021008_1280.jpg"
                        alt="Captain"
                    />
                </div>

                {/* Right: Name and Earnings */}
                <div className="captain-details-right">
                    <h4 className="captain-name">
                        {captain.fullname.firstname + ' ' + captain.fullname.lastname}
                    </h4>
                    <div className="captain-earnings">
                        <h4 className="earnings-amount">₹295.20</h4>
                        <p className="earnings-label">Earned</p>
                    </div>
                </div>
            </div>

            <div className="captain-stats-container">
                <div className="stat-item">
                    <i className="stat-icon ri-timer-2-line"></i>
                    <h5 className="stat-value">10.2</h5>
                    <p className="stat-label">Hours Online</p>
                </div>
                <div className="stat-item">
                    <i className="stat-icon ri-speed-up-line"></i>
                    <h5 className="stat-value">25</h5>
                    <p className="stat-label">Rides Completed</p>
                </div>
                <div className="stat-item">
                    <i className="stat-icon ri-booklet-line"></i>
                    <h5 className="stat-value">4.8</h5>
                    <p className="stat-label">Rating</p>
                </div>
            </div>
        </div>
    );
};

export default CaptainDetails;