import axios from "axios";

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
  try {
    const baseUrl = import.meta.env.VITE_APP_URL ? import.meta.env.VITE_APP_URL.replace(/\/$/, '') : '';
    console.log('Generating README via backend using baseUrl:', baseUrl);

    const response = await axios.post(`${baseUrl}/api/generate-readme`, {
      projectDetails,
      repoInfo
    });

    if (response.data && response.data.markdown) {
      return response.data.markdown;
    } else {
      throw new Error("Invalid response from generation API");
    }
  } catch (error: any) {
    console.error("README Generation Error:", error);
    const message = error.response?.data?.error || error.message || "Failed to generate README.";
    throw new Error(message);
  }
}

