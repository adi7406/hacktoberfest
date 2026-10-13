import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  const [activePage, setActivePage] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState(null);

  function handleStartChat(category = null) {
    setSelectedCategory(category);
    setActivePage('chat');
  }

  return (
    <div className="app-container">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      {activePage === 'landing' ? (
        <LandingPage onStartChat={handleStartChat} />
      ) : (
        <ChatPage
          initialCategory={selectedCategory}
          onResetCategory={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
