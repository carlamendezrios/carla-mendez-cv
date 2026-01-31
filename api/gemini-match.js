export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { company, role } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  const systemInstruction = `Eres el asistente estratégico de Carla Méndez. 
  REGLA DE APERTURA: Inicia con "Soy un bot diseñado por Carla...".
  CONTEXTO: Ingeniera Alimentaria y PM, +40 proyectos.
  ANALIZA PARA: Empresa ${company} y Puesto ${role}.
  CIERRE: Incluye linkedin.com/in/carla-mendez-rios.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemInstruction }] }]
      })
    });

    const data = await response.json();
    const cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Análisis no disponible.";
    
    return res.status(200).json({ text: cleanText });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
