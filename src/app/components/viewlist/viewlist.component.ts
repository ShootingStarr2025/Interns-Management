import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StagiaireService } from '../../services/stagiaire.service';
import { ActivatedRoute } from '@angular/router';
import { Stagiaire } from '../../models/stagiaire.model';

@Component({
  selector: 'app-viewlist',
  imports: [CommonModule],
  templateUrl: './viewlist.component.html',
  styleUrl: './viewlist.component.css',
})
export class ViewlistComponent implements OnInit {
  listStagiaires: any[] = []; // Holds all interns fetched
  stagiaire!: Stagiaire;
  isLoading: boolean = true; // Controls the loading spinner/placeholder

  constructor(
    private stagiaireService: StagiaireService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.stagiaireService.getStagiaireById(id).subscribe({
        next: (data: Stagiaire) => {
          this.stagiaire = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading intern:', err);
          this.isLoading = false;
        },
      });
    }
  }

  fetchStagiaireById(id: string) {
    this.isLoading = true;

    this.stagiaireService.getStagiaireById(id).subscribe({
      next: (stagiaire) => {
        this.listStagiaires = [stagiaire]; // Wrap single result into array
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading intern:', err);
        this.isLoading = false;
      },
    });
  }

  getduree(startDate: string, endDate: string): string {
    if (!startDate || !endDate) return 'N/A';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}
