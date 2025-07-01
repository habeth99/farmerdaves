import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-4 sm:p-6 md:p-8">
      <main className="text-center max-w-xs sm:max-w-md md:max-w-lg mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--color-borneo)] mb-3 sm:mb-4">
          Farmer Dave
        </h1>
        
        <p className="text-lg sm:text-xl text-[var(--color-box)] mb-6 sm:mb-8 px-2 sm:px-0">
          Welcome back! Please sign in to continue.
        </p>
        
        <Link href="/user-selection">
          <button className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-[var(--color-stone)] font-semibold py-2.5 px-6 sm:py-3 sm:px-8 rounded-lg text-base sm:text-lg transition-colors duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto">
            Sign In
          </button>
        </Link>
      </main>
    </div>
  );
}
