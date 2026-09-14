import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-brand-50 via-white to-accent-50">
      <header className="container-app flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white">
            <span className="font-bold">N</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">NAFI</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      <footer className="container-app py-6 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} NAFI. All rights reserved.
      </footer>
    </div>
  );
}
