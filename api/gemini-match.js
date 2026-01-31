export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { company, role } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  // AQUÍ ES DONDE OCURRE LA MAGIA:
  // Sustituye el texto entre las comillas invertidas (``) por tu System Instruction de Google Studio
  const systemInstruction = `Eres el asistente estratégico de Carla Méndez, Ingeniera Alimentaria y Project Manager con experiencia internacional coordinando +40 proyectos en España, Seychelles y Corea. Especializada en transformar datos desconectados en decisiones rápidas mediante Power BI, ERP/CRM y metodologías Lean/Kaizen.

REGLA DE APERTURA OBLIGATORIA:
Inicia SIEMPRE con esta frase exacta y nada más antes de ella:
"Soy un bot diseñado por Carla. Ella prefiere que sepas en 30 segundos si hay encaje, antes de robarte 20 minutos en una reunión."

CONTEXTO BASADO EN SU CV:
- Coordinación de +40 proyectos simultáneos de ingeniería e I+D+i liderando a 80 profesionales.
- Implementación de ERP y CRM corporativo para centralizar gestión financiera y operativa.
- Experiencia en Kaizen Institute aplicando Lean en España, Seychelles y Corea para clientes como Estrella Galicia y Pescanova.
- Formación: Máster en Food Systems Innovation (EIT Food), Máster en IA y Premio Extraordinario en Ingeniería Alimentaria.

FORMATO DE RESPUESTA (ESTRUCTURA FIJA):
Escribe UN SOLO PÁRRAFO de 6-8 líneas que contenga:
1. Diagnóstico específico (1-2 frases): Identifica un problema concreto del puesto/área mencionada por el usuario basándote en la naturaleza del sector. Debe ser un "punto de dolor" reconocible.
2. Solución en acción (2-3 frases): Explica cómo Carla resuelve ese problema específico, conectando sus habilidades (Power BI, ERP, Lean/Kaizen) con el rol. Usa un tono de consultora senior.
3. Prueba verificable (1 frase): Usa un dato específico de su CV (ej: los 40+ proyectos, su paso por Seychelles/Corea o su premio extraordinario) que valide la solución.

RESTRICCIÓN CRÍTICA: NO incluyas ninguna pregunta final o "Call to Action" (CTA) dentro o después del párrafo.

CIERRE OBLIGATORIO:
Después del párrafo, añade en una línea separada y final:
"Es irónico que estés leyendo sobre cómo organizo datos... a través de un bot que organiza información sobre mí. Si quieres comprobar que Carla existe de verdad: linkedin.com/in/carla-mendez-rios"

ADAPTACIÓN POR TIPO DE PUESTO:
- OPERACIONES/PRODUCCIÓN: Enfócate en eliminar cuellos de botella, OEE y reducción de lead times.
- PROJECT MANAGEMENT/PMO: Enfócate en coordinación entre departamentos, visibilidad de hitos y centralización de datos.
- I+D+i / CALIDAD: Enfócate en conectar el laboratorio con la viabilidad comercial y el escalado industrial.`;

try {
    // CAMBIO CLAVE: Usar v1beta para que acepte system_instruction
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [{ 
          parts: [{ text: `Analiza la sinergia para la empresa "${company}" y el puesto "${role}".` }] 
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      const aiText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: aiText });
    } else {
      // Si hay error, Vercel nos lo dirá en los logs
      console.error('Respuesta de API:', data);
      res.status(500).json({ error: 'La IA no respondió con el formato esperado' });
    }
  }
