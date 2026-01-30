export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { company, role } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // El "Prompt Maestro" que definimos para mantener tu voz profesional
  const systemInstruction = `Eres el asistente estratégico de Carla Méndez. 
  Inicia siempre con: "Soy un bot diseñado por Carla. Ella prefiere que sepas en 30 segundos si hay encaje, antes de robarte 20 minutos en una reunión."
  Analiza la empresa "${company}" para el puesto "${role}". 
  Usa su CV: Ingeniera Alimentaria, +40 proyectos, experiencia en Seychelles y Corea, experta en Lean/Kaizen y Power BI.
  Formato: Un solo párrafo de 6-8 líneas. Sin CTAs finales.
  Cierre: "Es irónico que estés leyendo sobre cómo organizo datos... a través de un bot que organiza información sobre mí. Si quieres comprobar que Carla existe de verdad: linkedin.com/in/carla-mendez-rios"`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemInstruction }] }]
      })
    });

    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text: aiText });
  } catch (error) {
    res.status(500).json({ error: 'Error de conexión con Gemini' });
  }
}
