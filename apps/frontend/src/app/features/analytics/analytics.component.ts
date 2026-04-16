import { Component, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { BaseChartDirective } from "ng2-charts";
import { ChartConfiguration, ChartData } from "chart.js";
import {
  AnalyticsService,
  AnalyticsData,
  Period,
} from "../../core/services/analytics.service";

@Component({
  selector: "app-analytics",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BaseChartDirective],
  templateUrl: "./analytics.component.html",
})
export class AnalyticsComponent implements OnInit {
  pageId = signal("");
  data = signal<AnalyticsData | null>(null);
  loading = signal(true);
  period = signal<Period>("30d");
  periods: { value: Period; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "all", label: "All Time" },
  ];

  // Chart configs
  lineChart = signal<ChartData<"line">>({ labels: [], datasets: [] });
  geoChart = signal<ChartData<"bar">>({ labels: [], datasets: [] });
  deviceChart = signal<ChartData<"doughnut">>({ labels: [], datasets: [] });
  genderChart = signal<ChartData<"doughnut">>({ labels: [], datasets: [] });
  sourceChart = signal<ChartData<"doughnut">>({ labels: [], datasets: [] });

  lineOptions: ChartConfiguration<"line">["options"] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };
  barOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    indexAxis: "y",
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } },
  };
  doughnutOptions: ChartConfiguration<"doughnut">["options"] = {
    responsive: true,
    plugins: { legend: { position: "bottom" } },
  };

  constructor(
    private route: ActivatedRoute,
    private analyticsService: AnalyticsService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("pageId")!;
    this.pageId.set(id);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.analyticsService.get(this.pageId(), this.period()).subscribe({
      next: (d) => {
        this.data.set(d);
        this.buildCharts(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changePeriod(p: Period) {
    this.period.set(p);
    this.load();
  }

  private buildCharts(d: AnalyticsData) {
    if (!d.ga4Data) return;

    // Line chart — time series
    this.lineChart.set({
      labels: d.ga4Data.timeSeries.map((r) => r.dimensionValues[0].value),
      datasets: [
        {
          data: d.ga4Data.timeSeries.map((r) =>
            Number(r.metricValues[0].value),
          ),
          borderColor: "#534AB7",
          backgroundColor: "rgba(83,74,183,0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        },
      ],
    });

    // Horizontal bar — geo
    this.geoChart.set({
      labels: d.ga4Data.geo.map((r) => r.dimensionValues[0].value),
      datasets: [
        {
          data: d.ga4Data.geo.map((r) => Number(r.metricValues[0].value)),
          backgroundColor: "#534AB7",
        },
      ],
    });

    // Doughnut — devices
    const colors = ["#534AB7", "#10b981", "#f59e0b", "#ef4444"];
    this.deviceChart.set({
      labels: d.ga4Data.devices.map((r) => r.dimensionValues[0].value),
      datasets: [
        {
          data: d.ga4Data.devices.map((r) => Number(r.metricValues[0].value)),
          backgroundColor: colors,
        },
      ],
    });

    // Doughnut — gender
    this.genderChart.set({
      labels: d.ga4Data.gender.map(
        (r) => r.dimensionValues[0].value || "Unknown",
      ),
      datasets: [
        {
          data: d.ga4Data.gender.map((r) => Number(r.metricValues[0].value)),
          backgroundColor: ["#818cf8", "#f472b6", "#94a3b8"],
        },
      ],
    });

    // Doughnut — sources
    this.sourceChart.set({
      labels: d.ga4Data.sources.map((r) => r.dimensionValues[0].value),
      datasets: [
        {
          data: d.ga4Data.sources.map((r) => Number(r.metricValues[0].value)),
          backgroundColor: [
            "#534AB7",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#06b6d4",
            "#8b5cf6",
          ],
        },
      ],
    });
  }

  get summary() {
    const rows = this.data()?.ga4Data?.summary || [];
    return {
      sessions: rows[0]?.value || "—",
      users: rows[1]?.value || "—",
      newUsers: rows[2]?.value || "—",
      bounceRate: rows[3]
        ? (Number(rows[3].value) * 100).toFixed(1) + "%"
        : "—",
      avgDuration: rows[4] ? Math.round(Number(rows[4].value)) + "s" : "—",
    };
  }

  totalClicks() {
    return (this.data()?.links || []).reduce(
      (sum, l) => sum + l.totalClicks,
      0,
    );
  }

  getGeoPercent(row: any, all: any[]): number {
    const total = all.reduce((s, r) => s + Number(r.metricValues[0].value), 0);
    if (!total) return 0;
    return Math.round((Number(row.metricValues[0].value) / total) * 100);
  }

  exportCsv() {
    const links = this.data()?.links;
    if (!links?.length) return;
    const rows = [
      [
        "Label",
        "Short Slug",
        "Target URL",
        "Total Clicks",
        "Today",
        "Top City",
      ],
      ...links.map((l) => [
        l.label,
        l.slug,
        l.targetUrl,
        l.totalClicks,
        l.todayClicks,
        l.topCity || "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `links-${this.pageId()}.csv`;
    a.click();
  }
}
