'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFarm } from '@/context/FarmContext';
import Link from 'next/link';

function AIChatbotInner() {
  const { user } = useAuth();
  const { farms, activeFarm, crops } = useFarm();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [useFarmContext, setUseFarmContext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(true);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    {
      title: 'Crop Yellowing Assessment',
      prompt: 'My tomato crop leaves are turning yellow from the bottom. What should I check regarding nutrients and irrigation?',
    },
    {
      title: 'Harvest Transport Planning',
      prompt: 'I have harvested 2 tonnes of vegetables and need to transport them to the nearest mandi. What vehicle and logistics steps are recommended?',
    },
    {
      title: 'Spraying Window Guidance',
      prompt: 'How do current weather conditions affect pesticide spraying and fertilizer application timing?',
    },
    {
      title: 'Soil Health Improvement',
      prompt: 'Based on a loamy soil with pH 6.8, what are the best organic practices to increase organic carbon and water retention?',
    },
  ];

  // Fetch conversation history
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      if (data.success) {
        setConversations(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Load active conversation messages
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      try {
        const res = await fetch(`/api/conversations/${activeConvId}`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.data?.messages || []);
        }
      } catch (err) {
        console.error('Failed to load conversation thread', err);
      }
    }
    loadMessages();
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || loading) return;

    setInputMessage('');
    setLoading(true);

    // Optimistic user message in UI
    const tempUserMsg = {
      _id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationId: activeConvId,
          useFarmContext: useFarmContext,
          farmId: activeFarm?._id,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        if (!activeConvId) {
          setActiveConvId(data.data.conversationId);
          fetchConversations();
        }
        setAiConfigured(data.data.isConfigured !== false);
        setMessages((prev) => [...prev, data.data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            _id: Date.now().toString(),
            role: 'assistant',
            content: data.error || 'AI service temporarily unavailable. Please try again.',
            sourceStatus: 'general_knowledge',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString(),
          role: 'assistant',
          content: 'Unable to communicate with AI endpoint. Please check your connection.',
          sourceStatus: 'general_knowledge',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/conversations/${convId}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeConvId === convId) {
          setActiveConvId(null);
          setMessages([]);
        }
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-4 animate-fade-in">
      {/* Left Sidebar: Conversations & Farm Context Indicator */}
      <div className="hidden md:flex flex-col w-64 card p-3.5 space-y-3 bg-white shrink-0">
        <button
          onClick={handleNewChat}
          className="btn btn-ai btn-sm w-full text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
        >
          New Conversation
        </button>

        {/* Farm Context Selector Card */}
        <div className="p-2.5 rounded-xl bg-ai-50/60 border border-ai-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ai-900 text-[11px] flex items-center gap-1">
              Use Farm Context
            </span>
            <input
              type="checkbox"
              id="contextToggle"
              checked={useFarmContext}
              onChange={(e) => setUseFarmContext(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-ai-600 cursor-pointer"
            />
          </div>
          <p className="text-[10px] text-ai-800 leading-tight">
            {useFarmContext && activeFarm
              ? `Injects: ${activeFarm.name} (${activeFarm.soilType || 'Soil'}, ${crops.length} crops)`
              : 'Generic mode (no farm records shared)'}
          </p>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 block mb-1">
            History ({conversations.length})
          </span>

          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => setActiveConvId(conv._id)}
                className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between group transition-colors ${
                  activeConvId === conv._id
                    ? 'bg-ai-50 text-ai-900 font-bold border border-ai-200'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <span className="truncate flex-1 pr-1">{conv.title}</span>
                <button
                  onClick={(e) => handleDeleteConversation(conv._id, e)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 p-0.5 text-xs transition-opacity"
                  title="Delete chat"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-neutral-400 text-[11px]">
              No past conversations yet.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 card flex flex-col justify-between overflow-hidden shadow-sm">
        {/* Chat Header */}
        <div className="p-3.5 border-b border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-ai-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
            </div>
            <div>
              <h2 className="font-bold text-sm text-neutral-900 font-display leading-tight">
                AgriMitra AI Assistant
              </h2>
              <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Agricultural & Logistics Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="md:hidden flex items-center gap-1.5 text-xs bg-neutral-100 px-2 py-1 rounded-lg">
              <span className="text-[10px] font-semibold">Farm Context:</span>
              <input
                type="checkbox"
                checked={useFarmContext}
                onChange={(e) => setUseFarmContext(e.target.checked)}
                className="w-3.5 h-3.5"
              />
            </div>

            <button
              onClick={handleNewChat}
              className="btn btn-ghost btn-sm text-xs py-1 px-2 md:hidden"
            >
              + New
            </button>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/40">
          {messages.length === 0 ? (
            <div className="max-w-xl mx-auto py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-ai-100 flex items-center justify-center mx-auto shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-ai-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
              </div>

              <div>
                <h3 className="text-xl font-bold font-display text-neutral-900">
                  Ask AgriMitra AI
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Your contextual farming assistant. Ask about crop stages, soil management, pest screening, weather interpretation, or agricultural transportation logistics.
                </p>
              </div>

              {/* Static Suggested Prompts */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block px-1">
                  Suggested Prompts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedPrompts.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s.prompt)}
                      className="p-3 rounded-xl bg-white border border-neutral-200/80 hover:border-ai-400 hover:shadow-xs text-left transition-all group"
                    >
                      <div className="font-bold text-xs text-neutral-900 group-hover:text-ai-700 flex items-center gap-1.5 mb-1">
                        <span>{s.title}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                        {s.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg._id || idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div
                    className={`${
                      isUser
                        ? 'chat-bubble-user'
                        : 'chat-bubble-ai border border-neutral-100 bg-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Source Status Transparency Badge */}
                    {!isUser && msg.sourceStatus && (
                      <div className="mt-2 pt-2 border-t border-neutral-100 text-[10px] text-neutral-400 flex items-center gap-1.5">
                        <span>
                          {msg.sourceStatus === 'user_data'
                            ? 'Answer enhanced with your active farm profile'
                            : msg.sourceStatus === 'live_api'
                            ? 'Verified with connected live service'
                            : 'AI agricultural recommendation — not guaranteed diagnosis'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Suggested Action Buttons if attached */}
                  {!isUser && msg.suggestedActions?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 pl-1">
                      {msg.suggestedActions.map((act, actIdx) => (
                        <Link
                          key={actIdx}
                          href={act.payload?.path || '/transport'}
                          className="btn btn-transport btn-sm text-[11px] py-1 px-3 shadow-xs"
                        >
                          {act.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-neutral-100 w-fit">
              <span className="w-2 h-2 rounded-full bg-ai-500 animate-ping" />
              <span className="text-xs text-neutral-500 font-medium">AgriMitra AI is analyzing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-neutral-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about crops, soil, pests, or transport logistics..."
              className="input text-sm flex-1"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="btn btn-ai btn-sm px-4 py-2 text-xs font-bold"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AIChatbotPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-500">Loading AI Assistant...</div>}>
      <AIChatbotInner />
    </Suspense>
  );
}
