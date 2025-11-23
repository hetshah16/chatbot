// FILE: pages/chatbot.jsx
"use client";

import React, { useState, useRef, useEffect } from 'react';


export default function ChatbotPage() {
const [messages, setMessages] = useState([
{ id: 1, role: 'assistant', text: 'Hi! I\'m your Gemini-powered assistant. Ask me anything.' },
]);
const [input, setInput] = useState('');
const [loading, setLoading] = useState(false);
const endRef = useRef(null);


useEffect(() => {
endRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);


async function sendMessage(e) {
e?.preventDefault();
const text = input.trim();
if (!text) return;


const userMsg = { id: Date.now(), role: 'user', text };
setMessages((m) => [...m, userMsg]);
setInput('');
setLoading(true);


try {
const res = await fetch('/api/gemini', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ prompt: text }),
});


if (!res.ok) {
const err = await res.text();
throw new Error(err || 'API error');
}


const data = await res.json();
// Expecting the API route to return { text: '...' }
const assistantMsg = { id: Date.now() + 1, role: 'assistant', text: data.text || 'No response' };
setMessages((m) => [...m, assistantMsg]);
} catch (err) {
console.error(err);
setMessages((m) => [...m, { id: Date.now() + 2, role: 'assistant', text: 'Sorry — there was an error. Check server logs.' }]);
} finally {
setLoading(false);
}
}


return (
<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
<div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6 grid grid-rows-[auto_1fr_auto]" style={{height: '80vh'}}>
<header className="flex items-center justify-between mb-4">
<h1 className="text-xl font-semibold">Chatbot For you</h1>
<div className="text-sm text-gray-500">Aayush for you</div>
</header>


<main className="overflow-y-auto p-2 flex flex-col gap-3" id="chat-window">
{messages.map((m) => (
<div key={m.id} className={`max-w-[80%] px-4 py-2 rounded-2xl ${m.role === 'user' ? 'self-end bg-blue-600 text-white rounded-br-none' : 'self-start bg-gray-100 text-gray-900 rounded-bl-none'}`}>
<div className="text-sm whitespace-pre-wrap">{m.text}</div>
</div>
))}
<div ref={endRef} />
</main>


<form onSubmit={sendMessage} className="mt-4 flex items-center gap-3">
<input
className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring"
placeholder="Type your message..."
value={input}
onChange={(e) => setInput(e.target.value)}
disabled={loading}
/>
<button
type="submit"
disabled={loading}
className="px-4 py-2 rounded-full bg-blue-600 text-white disabled:opacity-60"
>
{loading ? 'Thinking...' : 'Send'}
</button>
</form>
</div>
</div>
);
}