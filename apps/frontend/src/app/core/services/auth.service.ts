import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";

export interface Admin {
  id: string;
  email: string;
  name: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly TOKEN_KEY = "pp_token";
  private readonly ADMIN_KEY = "pp_admin";

  admin = signal<Admin | null>(this.loadAdmin());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(email: string, password: string) {
    return this.http
      .post<{ token: string; admin: Admin }>(
        `${environment.apiUrl}/auth/login`,
        {
          email,
          password,
        },
      )
      .pipe(
        tap(({ token, admin }) => {
          localStorage.setItem(this.TOKEN_KEY, token);
          localStorage.setItem(this.ADMIN_KEY, JSON.stringify(admin));
          this.admin.set(admin);
        }),
      );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_KEY);
    this.admin.set(null);
    this.router.navigate(["/login"]);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private loadAdmin(): Admin | null {
    try {
      const raw = localStorage.getItem(this.ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
