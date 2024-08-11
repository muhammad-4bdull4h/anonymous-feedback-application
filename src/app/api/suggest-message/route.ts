import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req: Request) {
  try {
    const key = process.env.GEMINAI;
    if (!key) {
      return Response.json({
        success: false,
        message: "error while suggesting message",
      });
    }
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Focus on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.You can also add questions like friends ask each other about personal matte Like confessions and girlfriends. Generate unique response every time(generate unique questions every single time)";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const res = response.text();

    return Response.json({
      success: true,
      message: res,
    });
  } catch (error) {
    console.log("error while suggesting message", error);
    return Response.json({
      success: false,
      message: "error while suggesting message",
    });
  }
}
