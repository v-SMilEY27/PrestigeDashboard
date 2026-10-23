import React from 'react';import {createRoot} from 'react-dom/client';import './index.css';import App from './App.jsx';import {migrateStorage} from './migrate.js';import StorageNotice from './StorageNotice.jsx';import TabGuard from './TabGuard.jsx';import PageFade from './PageFade.jsx';import RewardsHost from './RewardsWindow.jsx';
migrateStorage();
createRoot(document.getElementById('root')).render(<><TabGuard><App/></TabGuard><StorageNotice/><PageFade/><RewardsHost/></>);
