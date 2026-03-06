import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export interface RepoInfo {
  name: string;
  fullName: string;
  description: string;
  topics: string[];
  languages: string[];
  files: string;
  stars: number;
  forks: number;
  license?: string;
  owner: string;
  packageJson?: any;
  existingReadme?: string;
  repoUrl?: string;
}

export async function generateREADME(projectDetails: string, repoInfo?: RepoInfo) {
  // Create a new instance right before use to ensure it uses the latest API key from the environment/dialog
  // Check both GEMINI_API_KEY and API_KEY (injected by the selector)
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are an expert technical writer and developer. Generate a stunning, professional, and well-structured README.md file for the following project.
    
    ${repoInfo ? `
    GitHub Repository Context:
    - URL: ${repoInfo.repoUrl}
    - Name: ${repoInfo.name}
    - Full Name: ${repoInfo.fullName}
    - Owner: ${repoInfo.owner}
    - Description: ${repoInfo.description}
    - Topics: ${repoInfo.topics.join(", ")}
    - Languages: ${repoInfo.languages.join(", ")}
    - Root Files: ${repoInfo.files}
    - Stars: ${repoInfo.stars}
    - Forks: ${repoInfo.forks}
    - License: ${repoInfo.license || "Not specified"}
    
    BADGE GENERATION RULES:
    Use Shields.io for dynamic badges. Use the following formats:
    - Stars: https://img.shields.io/github/stars/${repoInfo.fullName}?style=for-the-badge&logo=github
    - Forks: https://img.shields.io/github/forks/${repoInfo.fullName}?style=for-the-badge&logo=github
    - License: https://img.shields.io/github/license/${repoInfo.fullName}?style=for-the-badge
    - Issues: https://img.shields.io/github/issues/${repoInfo.fullName}?style=for-the-badge
    - Pull Requests: https://img.shields.io/github/issues-pr/${repoInfo.fullName}?style=for-the-badge
    - Main Language: https://img.shields.io/github/languages/top/${repoInfo.fullName}?style=for-the-badge
    - Repo Size: https://img.shields.io/github/repo-size/${repoInfo.fullName}?style=for-the-badge
    
    ${repoInfo.packageJson ? `
    Technical Details (from package.json):
    - Version: ${repoInfo.packageJson.version}
    - Scripts: ${JSON.stringify(repoInfo.packageJson.scripts)}
    - Dependencies: ${JSON.stringify(repoInfo.packageJson.dependencies)}
    - DevDependencies: ${JSON.stringify(repoInfo.packageJson.devDependencies)}
    ` : ""}
    
    ${repoInfo.existingReadme ? `
    Existing README Snippet (for context):
    ${repoInfo.existingReadme}
    ` : ""}
    ` : ""}
    
    User Input & Additional Context:
    ${projectDetails}
    
    The README MUST include:
    1. A catchy title with an emoji.
    2. High-quality Badges (using Shields.io) for languages, license, stars, forks, and build status.
    3. A compelling and detailed description.
    4. A comprehensive Features list with emojis.
    5. Tech Stack section with icons/badges.
    6. Detailed Installation & Setup instructions (based on the scripts and dependencies found).
    7. Usage examples with code blocks.
    8. Project structure overview.
    9. Environment Variables section (if applicable).
    10. Contributing guide.
    11. License information (default to MIT if not specified).
    12. A "Show your support" section.
    13. Pricing details (if it's a SaaS or has tiers, otherwise mention it's free/open-source).
    
    Formatting Rules:
    - Use professional markdown formatting.
    - Use clean spacing and modern documentation standards.
    - Use emojis to make it engaging.
    - MANDATORY: Ensure all commands, scripts, and code snippets are properly formatted using markdown code fences (\`\`\`) with the appropriate language identifier (e.g., \`\`\`bash, \`\`\`typescript, \`\`\`json).
    - Return ONLY the markdown content. Do NOT include any preamble, reasoning, or JSON wrappers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt }
          ]
        }
      ],
      config: {
        tools: repoInfo?.repoUrl ? [{ urlContext: {} }] : []
      }
    });

    return response.text || "Failed to generate README content.";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate README using Gemini AI.");
  }
}
