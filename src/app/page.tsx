import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-8">
      <main className="text-center max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-green-800 mb-4">
          Farmer Dave
        </h1>
        
        <p className="text-xl text-green-600 mb-8">
          Sign up and get a free bigfoot statue!
        </p>
        
        <Link href="/signup">
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
            Sign Up
          </button>
        </Link>
      </main>
    </div>
  );
}
