export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { company, role } = req.body; // Estos vienen de los inputs BAIA y NPD
  const API_KEY = process.env.GEMINI_API_KEY;

  // PEGA AQUÍ TU PROMPT DE GOOGLE AI STUDIO
  const systemInstruction = `[AQUÍ VA TODO TU TEXTO DE GOOGLE STUDIO]
  
  CONTEXTO ACTUAL: Analiza la sinergia para la empresa "${company}" y el puesto "${role}".`;

  try {
    // Actualizado a gemini-2.5-flash como tienes en Studio
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemInstruction }] }]
      })
    });

    const data = await response.json();
    
    // Verificamos que la IA respondió correctamente
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const aiText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: aiText });
    } else {
      throw new Error('Respuesta inesperada de la API');
    }
  } catch (error) {
    res.status(500).json({ error: 'Error de conexión con Gemini 2.5' });
  }
}
