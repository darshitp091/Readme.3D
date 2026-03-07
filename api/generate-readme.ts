import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from "groq-sdk";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { projectDetails, repoInfo } = req.body;
    if (!projectDetails && !repoInfo) {
        return res.status(400).json({ error: "Project details or repo info is required" });
    }

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "GROQ_API_KEY is not configured in Vercel environment variables." });
    }

    const prompt = `
    You are an expert technical writer and developer. Generate a stunning, professional, and well-structured README.md file for the following project.
    
    ${repoInfo ? `
    GitHub Repository Context:
    - URL: https://github.com/${repoInfo.fullName}
    - Name: ${repoInfo.name}
    - Full Name: ${repoInfo.fullName}
    - Owner: ${repoInfo.owner}
    - Description: ${repoInfo.description}
    - Topics: ${repoInfo.topics?.join(", ")}
    - Languages: ${repoInfo.languages?.join(", ")}
    - Stars: ${repoInfo.stars}
    - Forks: ${repoInfo.forks}
    - License: ${repoInfo.license || "Not specified"}
    - Monorepo: ${repoInfo.isMonorepo ? "Yes" : "No"}
    - Includes Tests: ${repoInfo.hasTests ? "Yes" : "No"}
    
    BADGE GENERATION RULES:
    Use Shields.io for dynamic badges. Use the following formats:
    - Stars: https://img.shields.io/github/stars/${repoInfo.fullName}?style=for-the-badge&logo=github
    - Forks: https://img.shields.io/github/forks/${repoInfo.fullName}?style=for-the-badge&logo=github
    - License: https://img.shields.io/github/license/${repoInfo.fullName}?style=for-the-badge
    - Build: https://img.shields.io/github/actions/workflow/status/${repoInfo.fullName}/main.yml?style=for-the-badge
    
    ${repoInfo.packageJson ? `
    Technical Details (from package.json):
    - Version: ${repoInfo.packageJson.version}
    - Scripts: ${JSON.stringify(repoInfo.packageJson.scripts)}
    - Dependencies: ${JSON.stringify(repoInfo.packageJson.dependencies)}
    ` : ""}
    
    ${repoInfo.envExample ? `
    Environment Variables Required (.env.example):
    \`\`\`
    ${repoInfo.envExample}
    \`\`\`
    ` : ""}
    ` : ""}
    
    User Input & Additional Context:
    ${projectDetails}
    
    The README MUST include:
    1. A catchy title with an emoji.
    2. High-quality Badges (using Shields.io, style=for-the-badge).
    3. A compelling and detailed description.
    4. A comprehensive Features list with emojis.
    5. Tech Stack section with Shields.io badges for each major technology (e.g., React, TypeScript, Node.js, etc.).
       Format: https://img.shields.io/badge/NAME-COLOR?style=for-the-badge&logo=LOGO&logoColor=white
    6. Detailed Installation & Setup instructions.
    7. Usage examples with code blocks.
    8. Project structure overview tree.
    9. Environment Variables section.
    10. Contributing guide and License info.
    
    Formatting Rules:
    - Use professional markdown formatting.
    - Use clean spacing and modern documentation standards.
    - Use emojis to make it engaging.
    - Return ONLY the markdown content.
  `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 4096,
        });

        const markdown = completion.choices[0]?.message?.content || "Failed to generate README content.";
        res.json({ markdown });
    } catch (error: any) {
        console.error("Groq Generation Error:", error);
        res.status(500).json({ error: `Groq AI Error: ${error.message || "Failed to generate README."}` });
    }
}
