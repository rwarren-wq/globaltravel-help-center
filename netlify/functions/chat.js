const fs = require("fs");
const path = require("path");

exports.handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Parse request body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages)) {
    return { statusCode: 400, body: "Missing messages array" };
  }

  // Load knowledge base from file
  const kbPath = path.join(__dirname, "../../knowledge-base.txt");
  let systemPrompt;
  try {
    systemPrompt = fs.readFileSync(kbPath, "utf8");
  } catch (err) {
    console.error("Failed to load knowledge base:", err);
    return { statusCode: 500, body: "Knowledge base unavailable" };
  }

  // Call Anthropic API
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: "API key not configured" };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "prompt-caching-2024-07-31",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || "API error" }),
      };
    }

    const reply =
      data.content?.find((b) => b.type === "text")?.text ||
      "I'm having trouble right now. Please try again or contact support at 1-800-699-1725.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Fetch error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};
