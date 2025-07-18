import Link from 'next/link';

export default function UserSelection() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-4 sm:p-6 md:p-8">
      <main className="text-center max-w-2xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-borneo)] mb-8 sm:mb-12 px-4 sm:px-0">
          Who is signing in?
        </h1>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 mt-6 sm:mt-8">
          {/* Member Circle */}
          <Link href="/signin">
            <div className="flex flex-col items-center cursor-pointer group w-full sm:w-auto">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-[var(--color-sage)] hover:bg-[var(--color-box)] rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-colors duration-200 shadow-lg group-hover:shadow-xl">
                {/* Person Icon */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-borneo)] group-hover:text-[var(--color-pine)] transition-colors duration-200">
                Member
              </h2>
            </div>
          </Link>

          {/* Admin Circle */}
          <Link href="/signin/admin">
            <div className="flex flex-col items-center cursor-pointer group w-full sm:w-auto">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-[var(--color-sage)] hover:bg-[var(--color-box)] rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-colors duration-200 shadow-lg group-hover:shadow-xl">
                {/* Laptop Icon */}
                <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-borneo)] group-hover:text-[var(--color-pine)] transition-colors duration-200">
                Admin
              </h2>
            </div>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="mt-8 sm:mt-12">
          <Link href="/" className="text-[var(--color-pine)] hover:text-[var(--color-borneo)] text-sm sm:text-base transition-colors duration-200 inline-block py-2 px-4 rounded-md min-h-[44px] flex items-center justify-center">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
} 