export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { message } = req.body;

  const resumeData = `Vibhav Misra is a data science graduate student at Pace University in New York City, expected to graduate in May 2026. He holds a Bachelor's degree in Computer Science with a specialization in Artificial Intelligence and Machine Learning from Chandigarh University.

He has technical skills in Python, SQL, R, SAS, C++, and JavaScript. His machine learning experience includes supervised and unsupervised learning, neural networks, PCA, clustering, LSTM, and time series forecasting. He is proficient in tools like Pandas, NumPy, Scikit-Learn, TensorFlow, Prophet, Keras, Databricks, and Apache Spark.

His data visualization skills include Tableau, Power BI, Matplotlib, Seaborn, and Excel. He also has experience with big data tools such as Hadoop, MapReduce, MongoDB, and MySQL.

Vibhav has worked on multiple academic projects, including:
- A disease prediction app (BioML) using Flask and machine learning.
- A phishing website detection system using Gradient Boosting.
- Forecasting Amazon product review ratings using ARIMA, Prophet, and LSTM.
- Electric vehicle adoption analysis in Washington State.
- A comparative study of Decision Tree and Random Forest with hyperparameter tuning.

He completed a virtual data science internship with British Airways via Forage and holds certifications from IIT Madras, Coursera, and others in NLP, Data Science, and Mathematics.

He is fluent in English and a native speaker of Hindi`;

  const prompt = `
You are a chatbot trained on Vibhav Misra’s resume. Answer the following question based only on the information in the resume below.

Resume:
${resumeData}

Question: ${message}
`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768", 
        messages: [
          { role: "system", content: "You are a helpful assistant who knows everything about Vibhav Misra's resume." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Sorry, I couldn't come up with a response.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Groq API error:", error);
    res.status(500).json({ error: "Failed to fetch response from Groq." });
  }
}
