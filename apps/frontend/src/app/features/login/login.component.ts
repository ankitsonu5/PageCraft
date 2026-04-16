import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  email = signal("");
  password = signal("");
  loading = signal(false);
  error = signal("");

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {
    if (this.auth.isLoggedIn()) this.router.navigate(["/dashboard"]);
  }

  submit() {
    this.error.set("");
    if (!this.email() || !this.password()) {
      this.error.set("Email and password are required");
      return;
    }
    this.loading.set(true);
    this.auth.login(this.email(), this.password()).subscribe({
      next: () => this.router.navigate(["/dashboard"]),
      error: (err) => {
        this.error.set(err.error?.error || "Login failed");
        this.loading.set(false);
      },
    });
  }
}
