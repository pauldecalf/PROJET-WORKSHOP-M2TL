"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo / Nom */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm md:text-lg">
            IoT
          </div>
          <div>
            <h1 className="text-sm md:text-xl font-bold text-foreground">Digital Campus IoT</h1>
            <p className="text-[10px] md:text-xs text-muted-foreground">Workshop M2 TL</p>
          </div>
        </Link>

        {/* Widget Profil / Connexion */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            // Menu utilisateur connecté
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.role === 'SUPERVISOR' ? 'Superviseur' : 'Étudiant'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'SUPERVISOR' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Administration
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Bouton de connexion pour utilisateur non connecté
            <Button asChild>
              <Link href="/admin/login">
                <User className="mr-2 h-4 w-4" />
                Connexion
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

