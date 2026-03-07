import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

console.log("Starting server.ts...");

async function startServer() {
  console.log("Initializing Express app...");
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Comprehensive CORS configuration
  app.use(cors({
    origin: true, // Reflect request origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

  app.use(express.json());

  // Initialize Groq
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  console.log("Registering API routes...");
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route to analyze GitHub Repo
  app.post("/api/analyze-repo", async (req, res) => {
    console.log("POST /api/analyze-repo received", req.body);
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: "Repo URL is required" });

    try {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return res.status(400).json({ error: "Invalid GitHub URL" });

      const [_, owner, repo] = match;
      const cleanRepo = repo.replace(/\.git$/, "");

      const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}`);
      const langResponse = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/languages`);
      const contentsResponse = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/contents`);
      const files = contentsResponse.data.map((f: any) => f.name);
      
      let packageJson = null;
      if (files.includes("package.json")) {
        try {
          const pkgRes = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/contents/package.json`);
          const content = Buffer.from(pkgRes.data.content, 'base64').toString();
          packageJson = JSON.parse(content);
        } catch (e) {
          console.log("Failed to parse package.json");
        }
      }

      let existingReadme = "";
      const readmeFile = contentsResponse.data.find((f: any) => f.name.toLowerCase() === "readme.md");
      if (readmeFile) {
        try {
          const readmeRes = await axios.get(readmeFile.url);
          existingReadme = Buffer.from(readmeRes.data.content, 'base64').toString().substring(0, 2000);
        } catch (e) {
          console.log("Failed to fetch README");
        }
      }

      res.json({
        name: repoResponse.data.name,
        fullName: repoResponse.data.full_name,
        description: repoResponse.data.description,
        topics: repoResponse.data.topics,
        languages: Object.keys(langResponse.data),
        files: files.join(", "),
        stars: repoResponse.data.stargazers_count,
        forks: repoResponse.data.forks_count,
        license: repoResponse.data.license?.spdx_id || repoResponse.data.license?.name,
        owner: owner,
        packageJson: packageJson ? {
          dependencies: packageJson.dependencies,
          devDependencies: packageJson.devDependencies,
          scripts: packageJson.scripts,
          version: packageJson.version
        } : null,
        existingReadme: existingReadme
      });
    } catch (error: any) {
      console.error("Error analyzing repo:", error.message);
      res.status(500).json({ error: "Failed to analyze repository. Make sure it's public." });
    }
  });

  // New API Route to generate README using Groq
  app.post("/api/generate-readme", async (req, res) => {
    const { projectDetails, repoInfo } = req.body;
    
    if (!projectDetails && !repoInfo) {
      return res.status(400).json({ error: "Project details or repo info is required" });
    }

    const prompt = `
      You are an expert technical writer and developer. Generate a stunning, professional, and well-structured README.md file for the following project.
      
      ${repoInfo ? `
      GitHub Repository Context:
      - URL: ${repoInfo.repoUrl}
      - Name: ${repoInfo.name}
      - Full Name: ${repoInfo.fullName}
      - Owner: ${repoInfo.owner}
      - Description: ${repoInfo.description}
      - Topics: ${repoInfo.topics?.join(", ")}
      - Languages: ${repoInfo.languages?.join(", ")}
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
      
      Formatting Rules:
      - Use professional markdown formatting.
      - Use clean spacing and modern documentation standards.
      - Use emojis to make it engaging.
      - MANDATORY: Ensure all commands, scripts, and code snippets are properly formatted using markdown code fences (\`\`\`) with the appropriate language identifier.
      - Return ONLY the markdown content. Do NOT include any preamble, reasoning, or JSON wrappers.
    `;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-specdec",
        temperature: 0.7,
        max_tokens: 4096,
      });

      const markdown = completion.choices[0]?.message?.content || "Failed to generate README content.";
      res.json({ markdown });
    } catch (error: any) {
      console.error("Groq Generation Error:", error);
      res.status(500).json({ error: "Failed to generate README using Groq AI." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    // SPA fallback
    app.get("*", (req, res, next) => {
      if (req.url.startsWith("/api/")) return next();
      res.sendFile("index.html", { root: "dist" });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

