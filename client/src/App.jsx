import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import DocumentSimplifierPage from './pages/DocumentSimplifierPage';

export default function App() {
  const [activePage, setActivePage] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [initialChatMessage, setInitialChatMessage] = useState(null);

  function handleStartChat(category = null) {
    setSelectedCategory(category);
    setInitialChatMessage(null);
    setActivePage('chat');
  }

  function handleContinueFromSimplifier(messageText) {
    setInitialChatMessage(messageText);
    setActivePage('chat');
  }

  return (
    <div className="app-container">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      {activePage === 'landing' && (
        <LandingPage
          onStartChat={handleStartChat}
          onOpenSimplifier={() => setActivePage('simplifier')}
        />
      )}
      {activePage === 'simplifier' && (
        <DocumentSimplifierPage
          onContinueInChat={handleContinueFromSimplifier}
        />
      )}
      {activePage === 'chat' && (
        <ChatPage
          initialCategory={selectedCategory}
          initialMessage={initialChatMessage}
          onResetCategory={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
