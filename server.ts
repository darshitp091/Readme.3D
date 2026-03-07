import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Adsterra API Placeholder (for backend integration)
  app.get("/api/adsterra/stats", async (req, res) => {
    const apiKey = process.env.ADSTERRA_API_KEY;
    if (!apiKey || apiKey === 'your_adsterra_api_key_here') {
      return res.status(401).json({ error: "Adsterra API key not configured" });
    }
    // Placeholder for actual Adsterra API call
    res.json({ message: "Adsterra API is ready for integration", configured: true });
  });

  // API Route to analyze GitHub Repo
  app.post("/api/analyze-repo", async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: "Repo URL is required" });

    try {
      // Extract owner and repo from URL
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return res.status(400).json({ error: "Invalid GitHub URL" });

      const [_, owner, repo] = match;
      const cleanRepo = repo.replace(/\.git$/, "");

      // Fetch basic repo info
      const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}`);
      
      // Fetch languages
      const langResponse = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/languages`);
      
      // Fetch root directory structure
      const contentsResponse = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/contents`);
      const files = contentsResponse.data.map((f: any) => f.name);
      
      // Try to fetch package.json for tech stack info
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

      // Try to fetch existing README for context
      let existingReadme = "";
      const readmeFile = contentsResponse.data.find((f: any) => f.name.toLowerCase() === "readme.md");
      if (readmeFile) {
        try {
          const readmeRes = await axios.get(readmeFile.url);
          existingReadme = Buffer.from(readmeRes.data.content, 'base64').toString().substring(0, 2000); // Limit to 2k chars
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
