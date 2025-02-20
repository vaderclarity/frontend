import "./index.css";
import "./App.css";
import React, { useState } from "react";

function App() {
    const [text, setText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [sourceLanguage, setSourceLanguage] = useState("auto");
    const [targetLanguage, setTargetLanguage] = useState("fr");
    const [isLoading, setIsLoading] = useState(false); // New loading state

    // Function to handle speech recognition
    const handleVoiceInput = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = sourceLanguage !== "auto" ? sourceLanguage : "en-US";
        recognition.start();

        recognition.onresult = (event) => {
            const spokenText = event.results[0][0].transcript;
            setText(spokenText);
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
        };
    };

    // Function to handle translation
    const translateText = async () => {
        if (!text.trim()) {
            alert("Please enter text to translate.");
            return;
        }

        try {
            setIsLoading(true); // Set loading state
            setTranslatedText("Translating..."); // Provide immediate UI feedback

            const response = await fetch("https://backend-production-d990.up.railway.app/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, target_language: targetLanguage }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Translation failed.");
            }

            setTranslatedText(data.translated_text);
        } catch (error) {
            console.error("Translation Error:", error);
            alert(`Error: ${error.message}`);
            setTranslatedText(""); // Reset translated text if an error occurs
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    // Function to handle text-to-speech playback
    const handleSpeak = () => {
        if (!translatedText || translatedText === "Translating...") return;
        const utterance = new SpeechSynthesisUtterance(translatedText);
        utterance.lang = targetLanguage;
        speechSynthesis.speak(utterance);
    };

    return (
        <div className="container">
            <h1>Healthcare Translation App</h1>

            <div className="controls">
                <button onClick={handleVoiceInput}>🎤 Speak</button>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text..."
                />
            </div>

            <div className="language-selection">
                <label>Source Language:</label>
                <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
                    <option value="auto">Auto Detect</option>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                </select>

                <label>Target Language:</label>
                <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                </select>
            </div>

            <button onClick={translateText} disabled={isLoading}>
                {isLoading ? "Translating..." : "Translate"}
            </button>

            <div className="transcript-container">
                <div className="transcript">
                    <h2>Original:</h2>
                    <p>{text}</p>
                </div>
                <div className="transcript">
                    <h2>Translated:</h2>
                    <p>{translatedText}</p>
                </div>
            </div>

            <button onClick={handleSpeak} disabled={!translatedText || translatedText === "Translating..."}>
                🔊 Speak
            </button>
        </div>
    );
}

export default App;
