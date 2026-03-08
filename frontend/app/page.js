import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center text-white">
      
      <div className="text-center space-y-6">
        
        <h1 className="text-5xl font-bold">
          AI Mock Interview
        </h1>

        <p className="text-lg text-gray-300">
          Practice interviews with an AI interviewer
        </p>

        <Link href="/interview">
          <button className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg transition">
            Start Interview
          </button>
        </Link>

      </div>

    </main>
  );
}