import React, { useState } from 'react';
import { chatbotGemini } from '../services/api';

export default function Chatbot() {
  const [message, setMessage] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!message && !prescriptionText) return;
    setLoading(true);
    const payload = { message, prescriptionText };

    try {
      const res = await chatbotGemini.send(payload);
      setMessages(prev => [...prev, { from: 'user', text: message || prescriptionText }, { from: 'bot', text: res.reply, meta: res }]);
      setMessage('');
      setPrescriptionText('');
    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Error contacting chatbot. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  // image upload removed

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Pharmacy Chatbot</h1>
      <p className="mb-4 text-sm text-gray-600">Paste prescription text or ask a question. For dosing or medical advice, the chatbot will recommend contacting a licensed pharmacist.</p>

      <div className="mb-4">
        <label className="block text-sm font-medium">Message</label>
        <textarea
          className="w-full mt-1 p-2 border rounded"
          rows={2}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your question (e.g., 'Do you have Paracetamol?')"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Prescription Text (paste)</label>
        <textarea
          className="w-full mt-1 p-2 border rounded"
          rows={4}
          value={prescriptionText}
          onChange={e => setPrescriptionText(e.target.value)}
          placeholder="Paste prescription text here to detect medication names"
        />
      </div>

      {/* Image upload removed — use paste box for prescription text */}

      <div className="mb-6">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={send}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div className="space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className={m.from === 'user' ? 'text-right' : 'text-left'}>
            <div className={`${m.from === 'user' ? 'inline-block bg-blue-100' : 'inline-block bg-gray-100'} p-3 rounded`}>{m.text}</div>
            {m.meta && m.meta.medications && m.meta.medications.length > 0 && (
              <div className="mt-1 text-xs text-gray-700">
                <strong>Detected:</strong> {m.meta.medications.map(md => md.name).join(', ')}
              </div>
            )}
            {m.meta && m.meta.disclaimer && (
              <div className="mt-1 text-xs text-red-600">{m.meta.disclaimer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
