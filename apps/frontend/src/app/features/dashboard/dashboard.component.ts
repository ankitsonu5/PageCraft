import { Component, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";
import { ProjectService, Project } from "../../core/services/project.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./dashboard.component.html",
})
export class DashboardComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);
  showNewModal = signal(false);
  creating = signal(false);

  newName = signal("");
  newDesc = signal("");
  newColor = signal("#534AB7");

  constructor(
    public auth: AuthService,
    private projectService: ProjectService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.projectService.list().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openProject(id: string) {
    this.router.navigate(["/project", id]);
  }

  createProject() {
    if (!this.newName()) return;
    this.creating.set(true);
    this.projectService
      .create({
        name: this.newName(),
        description: this.newDesc(),
        color: this.newColor(),
      })
      .subscribe({
        next: (p) => {
          this.projects.update((arr) => [p, ...arr]);
          this.showNewModal.set(false);
          this.newName.set("");
          this.newDesc.set("");
          this.newColor.set("#534AB7");
          this.creating.set(false);
          this.router.navigate(["/project", p.id]);
        },
        error: () => this.creating.set(false),
      });
  }

  totalPages() {
    return this.projects().reduce((sum, p) => sum + (p._count?.pages || 0), 0);
  }

  deleteProject(e: Event, id: string) {
    e.stopPropagation();
    if (
      !confirm(
        "This will permanently delete the project and all its pages. Are you sure?",
      )
    )
      return;
    this.projectService.delete(id).subscribe(() => {
      this.projects.update((arr) => arr.filter((p) => p.id !== id));
    });
  }
}
