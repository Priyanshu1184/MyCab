import React, { useContext } from 'react';
import { CaptainDataContext } from '../context/CapatainContext';
import 'remixicon/fonts/remixicon.css';

const CaptainDetails = () => {
    const { captain } = useContext(CaptainDataContext);

    return (
        <div className="captain-details">
            <div className='captain-header'>
                <div className='captain-info'>
                    <img className='captain-img' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdlMd7stpWUCmjpfRjUsQ72xSWikidbgaI1w&s" alt="Captain" />
                    <h4 className='captain-name'>{captain.fullname.firstname + " " + captain.fullname.lastname}</h4>
                </div>
                <div className='captain-earnings'>
                    <h4 className='earnings-amount'>₹295.20</h4>
                    <p className='earnings-label'>Earned</p>
                </div>
            </div>
            <div className='captain-stats'>
                <div className='stat-item'>
                    <i className="stat-icon ri-timer-2-line"></i>
                    <h5 className='stat-value'>10.2</h5>
                    <p className='stat-label'>Hours Online</p>
                </div>
                <div className='stat-item'>
                    <i className="stat-icon ri-speed-up-line"></i>
                    <h5 className='stat-value'>10.2</h5>
                    <p className='stat-label'>Hours Online</p>
                </div>
                <div className='stat-item'>
                    <i className="stat-icon ri-booklet-line"></i>
                    <h5 className='stat-value'>10.2</h5>
                    <p className='stat-label'>Hours Online</p>
                </div>
            </div>
        </div>
    );
};

export default CaptainDetails;