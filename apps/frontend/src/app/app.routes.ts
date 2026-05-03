import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  {
    path: "login",
    loadComponent: () =>
      import("./features/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "project/:id",
    loadComponent: () =>
      import("./features/project/project.component").then(
        (m) => m.ProjectComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "builder/:id",
    loadComponent: () =>
      import("./features/builder/builder.component").then(
        (m) => m.BuilderComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "analytics/:pageId",
    loadComponent: () =>
      import("./features/analytics/analytics.component").then(
        (m) => m.AnalyticsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: "leads/:projectId",
    loadComponent: () =>
      import("./features/leads/leads.component").then((m) => m.LeadsComponent),
    canActivate: [authGuard],
  },
  {
    path: ":slug",
    loadComponent: () =>
      import("./features/page-viewer/page-viewer.component").then(
        (m) => m.PageViewerComponent,
      ),
  },
  { path: "**", redirectTo: "dashboard" },
];
