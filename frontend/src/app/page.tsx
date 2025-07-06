export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Academy Admin
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Modern Academy Management System
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome to Your Dashboard
            </h2>
            <p className="text-gray-600">
              Built with Next.js 14, TypeScript, Tailwind CSS, and FastAPI
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}