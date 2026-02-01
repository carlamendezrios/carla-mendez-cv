export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { company, role } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ text: "Error interno: Configuración de API ausente." });
  }

  // Prompt optimizado para ser directo y evitar filtros de seguridad
  const promptText = `Analiza brevemente por qué el perfil de Carla Méndez (Ingeniera Alimentaria y Project Manager con +40 proyectos) es un gran match para la empresa ${company} en el puesto de ${role}. Responde de forma profesional, tecnológica y breve en español.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();
    
    // Si la API de Google devuelve un error específico (como clave inválida o cuota)
    if (data.error) {
      console.error("Gemini Error:", data.error);
      return res.status(200).json({ text: "La IA está descansando. Intenta de nuevo en un momento." });
    }

    // Extraemos el texto de forma más segura
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return res.status(200).json({ text: "Match analizado, pero el formato de respuesta fue inesperado. Prueba con otra empresa." });
    }

    return res.status(200).json({ text: resultText.trim() });

  } catch (error) {
    return res.status(500).json({ text: "Error de conexión con el motor de análisis." });
  }
}
