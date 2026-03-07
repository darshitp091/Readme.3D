import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: "Repo URL is required" });

    try {
        const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) return res.status(400).json({ error: "Invalid GitHub URL" });

        const [_, owner, repo] = match;
        const cleanRepo = repo.replace(/\.git$/, "");

        // Fetch basic repo info
        const repoResponse = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}`);

        // Fetch languages
        const langResponse = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/languages`);

        // Fetch recursive directory structure (limited depth for performance/safety)
        const treeResponse = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/main?recursive=1`).catch(() =>
            axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/master?recursive=1`)
        );

        const tree = treeResponse.data.tree;
        const files = tree.filter((f: any) => f.type === 'blob').map((f: any) => f.path);
        const dirs = tree.filter((f: any) => f.type === 'tree').map((f: any) => f.path);

        // Analyze Tech Stack & Structure
        const hasPackageJson = files.includes("package.json");
        const hasRequirementsTxt = files.includes("requirements.txt");
        const hasDocker = files.includes("Dockerfile");
        const hasVite = files.includes("vite.config.ts") || files.includes("vite.config.js");
        const hasNext = files.includes("next.config.js") || files.includes("next.config.mjs");

        let packageJson = null;
        if (hasPackageJson) {
            try {
                const pkgRes = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/contents/package.json`);
                packageJson = JSON.parse(Buffer.from(pkgRes.data.content, 'base64').toString());
            } catch (e) { }
        }

        let envExample = "";
        const envFile = files.find((f: string) => f.endsWith(".env.example") || f === ".env.template");
        if (envFile) {
            try {
                const envRes = await axios.get(`https://api.github.com/repos/${owner}/${cleanRepo}/contents/${envFile}`);
                envExample = Buffer.from(envRes.data.content, 'base64').toString();
            } catch (e) { }
        }

        // Identify architecture patterns
        const isMonorepo = dirs.includes("packages") || dirs.includes("apps");
        const hasTests = dirs.some((d: string) => d.includes("test") || d.includes("__tests__"));

        res.json({
            name: repoResponse.data.name,
            fullName: repoResponse.data.full_name,
            description: repoResponse.data.description,
            topics: repoResponse.data.topics,
            languages: Object.keys(langResponse.data),
            files: files.slice(0, 50).join(", "), // Limit for summary
            totalFiles: files.length,
            stars: repoResponse.data.stargazers_count,
            forks: repoResponse.data.forks_count,
            license: repoResponse.data.license?.spdx_id || repoResponse.data.license?.name,
            owner: owner,
            isMonorepo,
            hasTests,
            envExample,
            packageJson: packageJson ? {
                dependencies: packageJson.dependencies,
                devDependencies: packageJson.devDependencies,
                scripts: packageJson.scripts,
                version: packageJson.version
            } : null,
            techStack: {
                hasPackageJson,
                hasRequirementsTxt,
                hasDocker,
                hasVite,
                hasNext
            }
        });
    } catch (error: any) {
        console.error("Error analyzing repo:", error.message);
        res.status(500).json({ error: "Failed to analyze repository. Make sure it's public." });
    }
}
