// No necesitamos importar fetch, Vercel ya lo incluye de forma nativa en Node 18+
module.exports = async (req, res) => {
  // Manejo de CORS y método
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, role } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // Aquí es donde la respuesta se vuelve dinámica basándose en el input
  const promptText = `
    Eres el asistente estratégico de Carla Méndez, Ingeniera Alimentaria y Project Manager.
    
    TAREA: Analiza la sinergia entre Carla y la oportunidad:
    - Empresa: ${company}
    - Puesto: ${role}
    
    PERFIL DE CARLA: Especialista en escalar proyectos alimentarios con IA, +40 proyectos gestionados, perfil híbrido técnico-estratégico.
    
    INSTRUCCIONES:
    1. Inicia: "Soy un bot diseñado por Carla..."
    2. Explica por qué es el "match" ideal para ${company} en el rol de ${role}.
    3. Sé creativo, breve y usa un tono tecnológico profesional.
    4. Cierra con su LinkedIn: linkedin.com/in/carla-mendez-rios.
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
    
    if (data.error) {
      return res.status(500).json({ text: "Error de Gemini: " + data.error.message });
    }

    const cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Análisis completado satisfactoriamente.";
    return res.status(200).json({ text: cleanText });

  } catch (error) {
    return res.status(500).json({ text: "Error de servidor al procesar el match." });
  }
};
