import React from 'react';

const ConversationItem: React.FC<{ message: string, time: string }> = ({ message, time }) => {
    return (
        <div className="conversation-item-wrapper">
            <div className="conversation-item-box">
                <div className="conversation-item-text">
                    <p>{message}</p>
                    <div className="conversation-item-time">{time}</div>
                </div>
                <div className="conversation-item-dropdown">
                    <button type="button" className="conversation-item-dropdown-toggle"><i className="ri-more-2-line"></i></button>
                    <ul className="conversation-item-dropdown-list">
                        <li><a href="#"><i className="ri-share-forward-line"></i> Forward</a></li>
                        <li><a href="#"><i className="ri-delete-bin-line"></i> Delete</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ConversationItem;
