export const runtime = "nodejs";          
export const dynamic = "force-dynamic";   

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'message' (string)" }), { status: 400 });
    }
    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), { status: 500 });
    }

    const resumeData = `
Vibhav Misra is a data science graduate student at Pace University in New York City, expected to graduate in May 2026. He holds a Bachelor's degree in Computer Science with a specialization in Artificial Intelligence and Machine Learning from Chandigarh University.

Technical skills:
- Programming: Python, SQL, R, React, JavaScript
- MLOps & Experiment Tracking: MLflow, Model Registry, Experiment Tracking
- Cloud Platforms: AWS (S3, Lambda, EMR on EC2)
- ML & AI: Supervised & Unsupervised Learning, Neural Networks, Time Series Forecasting, Generative AI (OpenAI API)
- Data Science & Analytics Tools: Pandas, NumPy, Scikit-Learn, TensorFlow, Prophet, Keras, Jupyter Notebooks, Anaconda
- Big Data & Databases: MySQL, MongoDB, HBase, Neo4j, Hadoop (HDFS, MapReduce), Apache Spark
- Data Visualization: Power BI, Looker, Tableau, Matplotlib, Seaborn, Excel

Professional experience:
- Data Science Intern, EdMyst Inc. (Lewes, DE), Jun–Sep 2025
  - Designed/documented personalization for "Edy" AI coach; long-term user memory using MongoDB, S3, Lambda, LLM prompt injection
  - Built real-time video chunking + multipart S3 uploads with WebRTC/Node

Projects:
- Exoplanet Habitability Explorer (RF classifier, presets, compare tray)
- Real-Time NYC Subway Tracker (target: Sep 2025)
- BioML disease prediction (Flask + ML)
- Phishing website detection (Gradient Boosting)
- Amazon review rating forecasting (ARIMA, Prophet, LSTM)
- EV adoption analysis in Washington State
- Decision Tree vs Random Forest (hyperparameter study)

Certifications:
- Coursera: Mathematics for ML & DS (LA, Calculus, Prob/Stats)
- Coursera: NLP Specialization (Classification, Prob Models, Sequence, Attention)
- Coursera/IBM: Applied Data Science Specialization
Languages: English (fluent), Hindi (native)
`;

    const prompt = `
You are a chatbot trained on Vibhav Misra’s resume. Answer the following question based only on the information in the resume below.

Resume:
${resumeData}

Question: ${message}
`;

    // Use Groq OpenAI-compatible endpoint with CURRENT model IDs
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Prefer current production models; 8B is fast, 70B is stronger.
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a helpful assistant who knows everything about Vibhav Misra's resume. Only use the resume content." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq error:", groqRes.status, errText);
      return new Response(JSON.stringify({ error: "Groq API error", details: errText.slice(0, 500) }), { status: 502 });
    }

    const data = await groqRes.json();
    const reply = data?.choices?.[0]?.message?.content ?? "Sorry, I couldn’t generate a response from the resume.";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    console.error("Handler error:", e);
    return new Response(JSON.stringify({ error: "Server error", details: String(e?.message ?? e) }), { status: 500 });
  }
}
