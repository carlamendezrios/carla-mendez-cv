const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { company, role } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // Prompt optimizado para un mejor análisis
  const promptText = `
    Eres el asistente estratégico de Carla Méndez, Ingeniera Alimentaria y Project Manager.
    Actúa con un tono profesional, tecnológico y entusiasta.
    
    Analiza la sinergia entre el perfil de Carla y esta oportunidad:
    - Empresa: ${company}
    - Puesto: ${role}
    
    INSTRUCCIONES:
    1. Empieza siempre con: "Soy un bot diseñado por Carla..."
    2. Explica por qué sus +40 proyectos y su perfil híbrido encajan.
    3. Sé breve (máximo 150 palabras).
    4. Finaliza invitando a contactar en linkedin.com/in/carla-mendez-rios.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();
    
    // Manejo de errores de la API de Google
    if (data.error) {
      return res.status(500).json({ text: "Error de API: " + data.error.message });
    }

    const cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar el análisis, intenta de nuevo.";
    return res.status(200).json({ text: cleanText });

  } catch (error) {
    return res.status(500).json({ text: "Error en el servidor al conectar con Gemini." });
  }
}
