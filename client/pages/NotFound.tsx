"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access:", pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">
          Oups ! La page demandée est introuvable.
        </p>
        <Link href="/" className="text-primary hover:underline font-medium">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
