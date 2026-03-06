# 🚀 README.3D - AI-Powered Documentation Generator

README.3D is a modern, high-performance web application designed to automate the creation of professional `README.md` files. Powered by **Gemini 3 Flash**, it analyzes your project context or descriptions to generate stunning, well-structured documentation in seconds.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-teal)
![Gemini](https://img.shields.io/badge/AI-Gemini%203%20Flash-orange)

## ✨ Features

- **🤖 AI-Driven Generation**: Leverages the latest Gemini 3 Flash model for intelligent content creation.
- **👁️ Real-time Preview**: See your documentation come to life as it's being generated with a built-in Markdown renderer.
- **🎨 Modern UI**: A sleek, responsive interface built with Tailwind CSS 4 and Framer Motion for smooth transitions.
- **📋 One-Click Copy**: Instantly copy generated markdown to your clipboard.
- **🛠️ Tech Stack Analysis**: Automatically suggests sections based on your project's technology.
- **✨ Interactive Elements**: Confetti celebrations upon successful generation!

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **AI Engine**: [@google/genai](https://ai.google.dev/) (Gemini 3 Flash)
- **Backend**: [Express](https://expressjs.com/) (serving as a lightweight proxy/server)
- **Markdown Rendering**: [react-markdown](https://github.com/remarkjs/react-markdown)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Gemini API Key (set in your environment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/readme-3d.git
   cd readme-3d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here

   # Adsterra Configuration (Optional)
   ADSTERRA_API_KEY=your_adsterra_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📖 Usage

1. Enter your project name and a brief description of what your project does.
2. Select the core technologies used in your project.
3. Click **"Generate Documentation"**.
4. Watch the AI craft your README in real-time.
5. Review the preview, make any manual adjustments if needed, and click **"Copy to Clipboard"**.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have suggestions for improvements.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the README.3D Team.
