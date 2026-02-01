export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { company, role } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) return res.status(500).json({ text: "Falta la API Key en Vercel." });

  const promptText = `Eres el asistente de Carla Méndez. Analiza la sinergia para la empresa ${company} y el puesto ${role}. Sé breve y profesional.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();
    const cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Análisis no disponible.";
    
    return res.status(200).json({ text: cleanText });
  } catch (error) {
    return res.status(500).json({ text: "Error al conectar con la IA." });
  }
}
