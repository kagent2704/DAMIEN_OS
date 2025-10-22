import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateResponse, fileToGenerativePart } from './services/geminiService';
import { useSpeech } from './hooks/useSpeech';
import ChatWindow from './components/ChatWindow';
import Dashboard from './components/Dashboard';
import { Message, Role, View, AnalyticsEntry, AppFile } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: Role.DAMIEN,
      content: "Hello! I am DAMIEN, your intelligent assistant. How can I help you today?",
      timestamp: new Date(),
    }
  ]);
  const [analytics, setAnalytics] = useState<AnalyticsEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.CHAT);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { isListening, transcript, startListening, stopListening, speak } = useSpeech({
    onStop: (finalTranscript) => {
      if (finalTranscript) {
        handleSendMessage(finalTranscript, undefined, 'voice');
      }
    }
  });

  const liveTranscriptRef = useRef(transcript);
  useEffect(() => {
    liveTranscriptRef.current = transcript;
  }, [transcript]);

  const addAnalyticsEntry = useCallback((entry: Omit<AnalyticsEntry, 'timestamp'>) => {
    setAnalytics(prev => [...prev, { ...entry, timestamp: new Date() }]);
  }, []);

  const processApiResponse = (response: string) => {
    // Action parsing
    const actionRegex = /\[ACTION: (\w+), PAYLOAD: '([^']*)'\]/;
    const actionMatch = response.match(actionRegex);
    if (actionMatch) {
      const [, action, payload] = actionMatch;
      console.log(`Executing Action: ${action} with payload: ${payload}`);
      switch (action) {
        case 'OPEN_APP':
          alert(`Simulating: Opening application "${payload}"`);
          break;
        case 'SEARCH_WEB':
          window.open(`https://www.google.com/search?q=${encodeURIComponent(payload)}`, '_blank');
          break;
        case 'WRITE_EXCEL':
           alert(`Simulating: Writing to Excel with data: "${payload}"`);
           break;
        case 'TYPE_TEXT':
            alert(`Simulating: Typing text: "${payload}"`);
            break;
        case 'OPEN_WEBSITE':
            let url = payload.trim();
            // If the payload contains spaces and no dot, it's ambiguous. Default to a search.
            if (url.includes(' ') && !url.includes('.')) {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(url)}`, '_blank');
                break;
            }
            // If it looks like a full URL, open it directly.
            if (/^https?:\/\//i.test(url)) {
                window.open(url, '_blank');
            } 
            // If it contains a dot, it's likely a domain like "google.com". Prepend https.
            else if (url.includes('.')) {
                window.open('https://' + url, '_blank');
            }
            // If it's a single word like "youtube", construct a .com domain.
            else {
                window.open(`https://${url}.com`, '_blank');
            }
            break;
      }
    }

    // Suggestion parsing
    const suggestionRegex = /\[SUGGESTION: '([^']*)'\]/g;
    const foundSuggestions = [...response.matchAll(suggestionRegex)].map(match => match[1]);
    setSuggestions(foundSuggestions);

    // Clean response for display and speech
    const cleanedForDisplay = response.replace(actionRegex, '').replace(suggestionRegex, '').trim();
    // The speech hook now handles markdown characters and emojis. We only need to handle link text here.
    const cleanedForSpeech = cleanedForDisplay.replace(/\[(.*?)\]\(.*?\)/g, '$1');
    
    return { cleanedForDisplay, cleanedForSpeech };
  };

  const handleSendMessage = async (text: string, file?: File, type: 'text' | 'voice' | 'file' = 'text') => {
    if (!text && !file) return;

    const userMessageContent = text || `Analyzing file: ${file?.name}`;
    let appFile: AppFile | undefined = undefined;

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      appFile = { name: file.name, type: file.type, url: objectUrl, file: file };
    }

    const userMessage: Message = { role: Role.USER, content: userMessageContent, file: appFile, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setSuggestions([]);

    try {
      const filePart = file ? await fileToGenerativePart(file) : undefined;
      const response = await generateResponse(text, filePart);
      const { cleanedForDisplay, cleanedForSpeech } = processApiResponse(response);

      const damienMessage: Message = { role: Role.DAMIEN, content: cleanedForDisplay, timestamp: new Date() };
      setMessages(prev => [...prev, damienMessage]);
      speak(cleanedForSpeech);
      
      addAnalyticsEntry({ command: userMessageContent, response: cleanedForDisplay, type });
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: Message = { role: Role.DAMIEN, content: "Sorry, I encountered an error. Please try again.", timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  }

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="bg-cover bg-center min-h-screen w-full flex items-center justify-center p-4 font-sans" style={{backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=5')"}}>
        {currentView === View.CHAT && (
          <ChatWindow 
            messages={messages}
            isLoading={isLoading}
            isListening={isListening}
            liveTranscript={transcript}
            suggestions={suggestions}
            onSendMessage={handleSendMessage}
            onSuggestionClick={handleSuggestionClick}
            onViewChange={() => setCurrentView(View.DASHBOARD)}
            onToggleVoice={toggleVoice}
          />
        )}
        {currentView === View.DASHBOARD && (
          <Dashboard 
            analyticsData={analytics}
            onViewChange={() => setCurrentView(View.CHAT)}
          />
        )}
    </div>
  );
};

export default App;