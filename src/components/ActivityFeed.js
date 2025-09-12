// src/components/ActivityFeed.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// THAY THẾ CÁC IMPORT ICON MỚI TẠI ĐÂY
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faQrcode, faUserPen, faCirclePlus } from '@fortawesome/free-solid-svg-icons'; // Các icon Solid

import './ActivityFeed.css';

const ActivityFeed = () => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const q = query(
            collection(db, 'activity_log'), 
            orderBy('timestamp', 'desc'), 
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const activitiesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActivities(activitiesData);
        });

        return () => unsubscribe();
    }, []);

    // Hàm trả về icon dựa trên loại hoạt động
    const getActivityIcon = (action) => {
        switch (action) {
            case 'thêm nhật ký':
                return faLeaf; // Icon lá cây
            case 'thêm giai đoạn canh tác':
                return faCirclePlus; // Icon dấu cộng tròn
            case 'tạo mã QR':
                return faQrcode; // Icon mã QR
            default:
                return faUserPen; // Icon người dùng hoặc bút (mặc định)
        }
    };

    return (
        <div className="activity-feed-section">
            <h2>Hoạt động Mới nhất</h2>
            <ul className="activity-list">
                {activities.map(activity => (
                    <li key={activity.id} className="activity-item">
                        {/* SỬ DỤNG COMPONENT FontAwesomeIcon */}
                        <span className="activity-icon">
                            <FontAwesomeIcon icon={getActivityIcon(activity.action)} />
                        </span>
                        <div className="activity-content">
                            <p>
                                <strong>{activity.userEmail}</strong> vừa {activity.action} {activity.details}
                            </p>
                            <span className="activity-time">
                                {activity.timestamp && formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true, locale: vi })}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActivityFeed;