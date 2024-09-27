import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"

dotenv.config()

// Ensure environment variable is loaded properly (you can use dotenv if needed)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const Generate = async (req, res) => {
  try {
    const prompt = req.body.message

        if(!prompt){
            return res.status(500).json({ message: "type something to get response" });
        }

    const result = await model.generateContent(prompt);

    const content = await result.response.text();  // Retrieve the text response
    console.log(content);

    return res.json({ content });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "error in gemini api" });
  }
};
