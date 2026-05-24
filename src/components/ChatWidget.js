import React, { useState, useRef, useEffect } from 'react';
import { chatbotGemini } from '../services/api';
import { products } from '../data/products';

export default function ChatWidget() {

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages]);



  const send = async () => {

    if (!message.trim() && !prescriptionText.trim())
      return;

    const userText = message || prescriptionText;

    const updatedMessages = [
      ...messages,
      {
        from: 'user',
        text: userText
      }
    ];

    setMessages(updatedMessages);

    // detect price questions and answer locally from product list
    const q = (message || prescriptionText || '').toLowerCase();
    const isPriceQuery = q.includes('price') || q.includes('how much') || q.includes('cost') || q.includes("how much is") || q.includes('what is the price') || q.includes('price of');

    if (isPriceQuery) {
      const qTokens = q.split(/[^a-z0-9]+/).filter(Boolean);
      const match = products.find(p => {
        const name = p.name.toLowerCase();
        const tokens = name.split(/[^a-z0-9]+/).filter(Boolean).filter(t => t.length >= 2);
        return tokens.some(tok => qTokens.includes(tok));
      });

      if (match) {
        setMessages(prev => [...prev, { from: 'bot', text: `The price of ${match.name} is $${match.price.toFixed(2)}. ${match.inStock ? 'In stock.' : 'Currently out of stock.'}` }]);
        setMessage('');
        setPrescriptionText('');
        return;
      } else {
        // Explicitly answer price queries we can't resolve locally
        setMessages(prev => [...prev, { from: 'bot', text: `Sorry — I don't have pricing information for "${message || prescriptionText}". Try using the exact product name (for example: "Paracetamol 500mg") or check the products page.` }]);
        setMessage('');
        setPrescriptionText('');
        return;
      }
    }

    setLoading(true);

    try {

      const payload = {

        message,
        prescriptionText,

        history: updatedMessages.map(m => ({
          role:
            m.from === 'user'
              ? 'user'
              : 'assistant',

          content: m.text
        }))
      };

      console.log("PAYLOAD:");
      console.log(payload);

      const res =
        await chatbotGemini.send(payload);

      console.log("FULL RESPONSE:");
      console.log(res);

      let botText='';

      if(!res){

        botText =
          'No response received from AI service.';
      }

      else if(typeof res==='string'){

        botText=res;
      }

      else if(typeof res==='object'){

        botText=
          res.reply ||
          res.message ||
          res.text ||
          res.body?.reply ||
          res.body?.message ||
          '';
      }

      else{

        botText=String(res);
      }


      if(!botText.trim()){

        botText =
          'Empty response received from AI.';
      }


      // detect backend-ready problems from the bot text
      const lower = (botText || '').toLowerCase();
      const backendNotReady = !botText
        || (lower.includes('gemini') && lower.includes('not configured'))
        || lower.includes('no response')
        || lower.includes('error contacting')
        || lower.includes('failed to contact')
        || lower.includes('failed to contact gemini');

      // inspect user question to decide fallback content
      const textToCheckLocal = `${message || ''} ${prescriptionText || ''}`.toLowerCase();
      const isParacetamol = textToCheckLocal.includes('panadol') || textToCheckLocal.includes('paracetamol') || textToCheckLocal.includes('acetaminophen');
      const isAspirin = textToCheckLocal.includes('aspirin') || textToCheckLocal.includes('acetylsalicylic') || textToCheckLocal.includes('asa');
      const isIbuprofen = textToCheckLocal.includes('ibuprofen') || textToCheckLocal.includes('advil') || textToCheckLocal.includes('motrin') || textToCheckLocal.includes('nurofen') || textToCheckLocal.includes('profen') || textToCheckLocal.includes('profinal');
      const isWhey = textToCheckLocal.includes('whey') || textToCheckLocal.includes('protein powder') || textToCheckLocal.includes('protein shake') || textToCheckLocal.includes('whey protein');
      const isCreatine = textToCheckLocal.includes('creatine') || textToCheckLocal.includes('creapure') || textToCheckLocal.includes('creatine monohydrate');

      if (backendNotReady) {
        let fallback = '';
        if (isWhey) {
          fallback = `General info only — consult a pharmacist, dietitian, or doctor for personalized advice. Typical serving: 20–40 g (one scoop) of whey protein per serving. Common uses: after resistance exercise to support muscle repair, between meals to help reach daily protein goals, or as a convenient protein source.

How to take: mix with water or milk per product directions; use whey isolate if lactose intolerant. Timing: post-workout (within ~30–60 minutes) or as needed to meet total daily protein. Choose products checked for contaminants and follow label dosing.

Warnings: usually unnecessary if you already meet protein needs from food; avoid very high daily protein if you have severe kidney disease; check for milk/dairy allergy. For tailored dosing, consult a healthcare professional.`;
        } else if (isCreatine) {
          fallback = `General info only — consult a pharmacist, dietitian, or doctor for personalized advice. Typical creatine regimen: maintenance dose 3–5 g daily. Optional loading: ~20 g/day split into 4 doses for 5–7 days to saturate muscles faster.

      How to take: mix creatine monohydrate with water or a carbohydrate-containing drink; timing can be pre- or post-workout, daily consistency matters more than timing.

      Warnings: generally well tolerated in healthy people; ensure adequate fluid intake. Avoid high doses if you have pre-existing kidney disease or other chronic conditions — check with your healthcare provider. Use tested, pure creatine monohydrate products.`;

        } else if (isParacetamol) {
          fallback = `Safety note: I can give general information only — consult a licensed pharmacist or doctor for exact, personalized dosing.\n\nAdults (paracetamol): 500–1000 mg every 4–6 hours as needed. Do not exceed 4,000 mg in 24 hours.\n\nChildren (weight‑based): 10–15 mg/kg per dose every 4–6 hours; maximum 4 doses in 24 hours.\n\nInfants / <2 years: Ask a pediatrician or pharmacist before giving.\n\nWarnings: Do not combine products containing paracetamol. `;
        } else if (isAspirin) {
          fallback = `Safety note: I can give general information only — consult a licensed pharmacist or doctor.\n\nUses: pain, fever, inflammation; low‑dose aspirin used for cardiovascular protection.\n\nAdult analgesic dose (aspirin): 300–1000 mg every 4–6 hours as needed. Low‑dose cardioprotection: 75–100 mg once daily as prescribed.\n\nChildren: avoid aspirin for children/teens with viral illness (Reye's syndrome).\n\nWarnings: avoid with bleeding disorders, ulcers, some blood thinners, and late pregnancy. `;
        } else if (isIbuprofen) {
          fallback = `Safety note: I can give general information only — consult a licensed pharmacist or doctor for exact, personalized dosing.\n\nAdults (ibuprofen): 200–400 mg every 4–6 hours as needed. OTC maximum typically 1,200 mg per day; some prescriptions allow up to 2,400 mg per day under medical supervision.\n\nChildren (weight‑based): 5–10 mg/kg per dose every 6–8 hours; follow product labeling or pharmacist guidance.\n\nWarnings: take with food to reduce stomach upset; avoid in active peptic ulcer disease, severe heart failure, or uncontrolled hypertension without medical advice. `;
        } else {
          // generic non-dosing fallback to avoid giving incorrect specific doses
          fallback = `Safety note: I can give general information only — consult a licensed pharmacist or doctor for exact dosing and suitability. I can help with general precautions, interactions, and when to seek care.`;
        }

        setMessages(prev => [...prev, { from: 'bot', text: fallback }]);
      } else {
        setMessages(prev => [...prev, { from: 'bot', text: botText, meta: res }]);
      }

      setMessage('');
      setPrescriptionText('');

    } catch (err) {

      console.error(err);

      setMessages(prev=>[
        ...prev,
        {
          from:'bot',
          text:
          `The AI service is currently unavailable.

Please try again later.

Error: ${
            err?.message ||
            'Unknown error'
          }`
        }
      ]);

    }

    finally{

      setLoading(false);
    }
  };


  return (

<div className="fixed bottom-6 right-6 z-50">

{!open && (

<button
  onClick={() => setOpen(true)}
  className="text-white rounded-full p-4 shadow-lg"
  style={{ backgroundColor: '#06b6d4' }}
>
  💬
</button>

)}

{open && (

<div className="w-80 md:w-96 bg-white rounded-xl shadow-xl overflow-hidden">

<div className="text-white px-4 py-3 flex justify-between" style={{ backgroundColor: '#06b6d4' }}>

<div>

<div className="font-semibold">
Virtual Assistant
</div>

<div className="text-xs">
How can I help you today?
</div>

</div>

<button
onClick={()=>setOpen(false)}
>
✕
</button>

</div>


<div className="p-3 max-h-72 overflow-y-auto bg-gray-50 space-y-3">

{messages.length===0 && (

<div className="text-sm text-gray-500">

Ask anything...

</div>

)}

{messages.map((m,i)=>(

<div
key={i}
className={
m.from==='user'
?'text-right'
:'text-left'
}
>

<div className="inline-block p-2 rounded-lg shadow-sm" style={m.from === 'user' ? { backgroundColor: '#e6fbfb' } : { backgroundColor: '#ffffff' }}>

{m.text}

</div>

</div>

))}

{loading && (

<div className="text-sm text-gray-500">

AI is typing...

</div>

)}

<div ref={messagesEndRef}/>

</div>

<div className="p-3">

<textarea
rows={2}
value={message}
onChange={(e)=>
setMessage(e.target.value)
}
className="w-full border rounded p-2 mb-2"
placeholder="Write your message..."
/>



<button
  onClick={send}
  disabled={loading}
  className="w-full text-white py-2 rounded"
  style={{ backgroundColor: '#06b6d4' }}
>

  {loading ? 'Sending...' : 'Send'}

</button>

</div>

</div>

)}

</div>

);

}