import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-8">
      <main className="text-center max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-[var(--color-borneo)] mb-4">
          Farmer Dave
        </h1>
        
        <p className="text-xl text-[var(--color-box)] mb-8">
          Sign up and get a free bigfoot statue!
        </p>
        
        <Link href="/dashboard">
          <button className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-[var(--color-stone)] font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
            Sign Up
          </button>
        </Link>
      </main>
    </div>
  );
}
