import { Component, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import {
  LeadsService,
  FanLead,
  LeadsSummary,
} from "../../core/services/leads.service";

@Component({
  selector: "app-leads",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./leads.component.html",
})
export class LeadsComponent implements OnInit {
  projectId = signal("");
  leads = signal<FanLead[]>([]);
  summary = signal<LeadsSummary | null>(null);
  total = signal(0);
  loading = signal(true);
  filterPlatform = signal("");
  filterSegment = signal("");

  segments = ["cold", "warm", "hot"];

  constructor(
    private route: ActivatedRoute,
    private leadsService: LeadsService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("projectId")!;
    this.projectId.set(id);
    this.loadSummary();
    this.loadLeads();
  }

  loadSummary() {
    this.leadsService.getSummary(this.projectId()).subscribe({
      next: (s) => this.summary.set(s),
    });
  }

  loadLeads() {
    this.loading.set(true);
    this.leadsService
      .getLeads(this.projectId(), {
        platform: this.filterPlatform() || undefined,
        segment: this.filterSegment() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.leads.set(res.leads);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  applyFilters() {
    this.loadLeads();
  }

  clearFilters() {
    this.filterPlatform.set("");
    this.filterSegment.set("");
    this.loadLeads();
  }

  exportCsv() {
    window.open(`/api/leads/manage/export/${this.projectId()}`, "_blank");
  }
}
