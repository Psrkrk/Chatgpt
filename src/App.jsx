import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { FiSend } from "react-icons/fi";
import { FiCopy } from "react-icons/fi"; // Add an icon for copy

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [hasCode, setHasCode] = useState(false); // New state to track if answer contains code

  useEffect(() => {
    if (answer) {
      document.getElementById("answer-container").scrollIntoView({
        behavior: "smooth",
      });
    }

    // Check if the answer contains code blocks
    setHasCode(answer.includes("```"));
  }, [answer]);

  async function generateAnswer(e) {
    e.preventDefault();
    setGeneratingAnswer(true);
    setAnswer("");
    setQuestion(""); // Clear the input bar after form submission

    let loadingText = "Loading your answer";
    setAnswer(loadingText);

    const typingInterval = setInterval(() => {
      if (loadingText.length < 30) {
        loadingText += ".";
        setAnswer(loadingText);
      } else {
        loadingText = "Loading your answer";
        setAnswer(loadingText);
      }
    }, 500);

    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
          import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT
        }`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });

      clearInterval(typingInterval);
      const responseText =
        response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setAnswer(responseText);
      setHasCode(responseText.includes("```")); // Set hasCode based on response content
    } catch (error) {
      clearInterval(typingInterval);
      setAnswer("Sorry - Something went wrong. Please try again!");
    } finally {
      setGeneratingAnswer(false);
    }
  }

  // Function to copy the answer content to clipboard
  function copyToClipboard() {
    navigator.clipboard
      .writeText(answer)
      .then(() => {
        alert("Code copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy!");
      });
  }

  return (
    <div className="main-container">
      <form onSubmit={generateAnswer} className="form-container">
        <a
          href="https://github.com/Psrkrk/Chatgpt"
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-4 text-center"
        >
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 animate-pulse">
            Chat AI
          </h1>
        </a>
        <div className="relative w-full flex items-center my-2">
          <textarea
            required
            className="w-full p-4 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            style={{ backgroundColor: "#1a1a1a", color: "#fff" }}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything..."
            disabled={generatingAnswer} // Disable input when generating answer
          ></textarea>
          <button
            type="submit"
            className="absolute right-2 bottom-2 text-purple-500 hover:text-purple-700 transition-all duration-300"
            disabled={generatingAnswer} // Disable button when generating answer
          >
            <FiSend size={24} />
          </button>
        </div>
      </form>

      <div id="answer-container" className="answer-container">
        <ReactMarkdown className="prose text-left">{answer}</ReactMarkdown>

        {/* Show Copy Button only if code is detected */}
        {hasCode && (
          <button onClick={copyToClipboard} className="copy-button">
            <FiCopy /> Copy Code
          </button>
        )}
      </div>

      <footer className="footer">
        <p>© 2024 Pankaj Suman. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
