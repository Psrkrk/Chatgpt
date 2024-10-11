import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  useEffect(() => {
    if (answer) {
      document.getElementById("answer-container").scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [answer]);

  async function generateAnswer(e) {
    e.preventDefault();
    setGeneratingAnswer(true);
    setAnswer("");
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
      setAnswer(
        response["data"]["candidates"][0]["content"]["parts"][0]["text"]
      );
    } catch (error) {
      clearInterval(typingInterval);
      setAnswer("Sorry - Something went wrong. Please try again!");
    } finally {
      setGeneratingAnswer(false);
    }
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
        <textarea
          required
          className="w-full p-4 my-2 transition-all border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything..."
        ></textarea>
        <button
          type="submit"
          className={`w-full mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-3 rounded-lg font-bold shadow-md hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 ${
            generatingAnswer ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={generatingAnswer}
        >
          {generatingAnswer ? "Generating..." : "Generate Answer"}
        </button>
      </form>

      <div id="answer-container" className="answer-container">
        <ReactMarkdown className="prose text-left text-gray-800">{answer}</ReactMarkdown>
      </div>

      {/* Footer with Copyright */}
      <footer className="footer">
        <p>© 2024 Pankaj Suman. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
