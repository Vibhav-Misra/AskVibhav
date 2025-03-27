async function sendMessage() {
  const inputField = document.getElementById('userInput');
  const userText = inputField.value.trim();
  if (!userText) return;

  const chatbox = document.getElementById('chatbox');

  chatbox.innerHTML += `<p class="user">${userText}</p>`;
  inputField.value = '';
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: userText })
    });

    const data = await response.json();
    const reply = data.reply || "Sorry, something went wrong.";

    // Show bot response
    chatbox.innerHTML += `<p class="bot">${reply}</p>`;
    chatbox.scrollTop = chatbox.scrollHeight;

  } catch (err) {
    console.error("Error:", err);
    chatbox.innerHTML += `<p class="bot">⚠️ Error fetching response.</p>`;
  }
}
