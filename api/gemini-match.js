export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { company, role } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) return res.status(500).json({ text: "Error: Configuración incompleta." });

  // Prompt optimizado para evitar bloqueos de seguridad de la IA
  const promptText = `Actúa como Carla Méndez, Ingeniera Alimentaria y PM. 
  Analiza brevemente por qué tu perfil es ideal para la empresa ${company} en el puesto de ${role}. 
  Responde de forma profesional y tecnológica en español. Máximo 3 frases.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();
    
    // Si la IA responde pero hay un problema de seguridad o formato
    const cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!cleanText) {
      console.error("Respuesta vacía de Gemini:", data);
      return res.status(200).json({ text: "La IA no ha podido generar una respuesta ahora mismo. Intenta con otra empresa." });
    }
    
    return res.status(200).json({ text: cleanText });

  } catch (error) {
    return res.status(500).json({ text: "Error de conexión con el cerebro de la IA." });
  }
}
