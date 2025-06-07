import { Component, OnInit } from '@angular/core';
import { StagiaireService } from '../../services/stagiaire.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-stagiaire-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './stagiaire-list.component.html',
  styleUrl: './stagiaire-list.component.css'
})
export class StagiaireListComponent implements OnInit{

    listStagiaires: any[] = [];
    isLoading: boolean = false;

    constructor(private stagiaireService: StagiaireService, private router: Router) {}

    ngOnInit() {
      this.loadStagiaire();
    }

    loadStagiaire() {
      this.isLoading = true;

      this.stagiaireService.getStagiaires().subscribe({
        next: (data) => {
          this.listStagiaires = data;
          console.log('Get full list:', this.listStagiaires)
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          alert('Error occurred');
        }
      });
    }

      getduree(start: string, end: string): number {

      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays > 0 ? diffDays : 0;
    }

    navigateToForm() {
      this.router.navigate(['/add']);
    }

    edit(id: string) {
      this.router.navigate(['/edit', id]);
    }

    delete(id: string) {
      if (confirm('You wanna delete this intern?')) {
        this.stagiaireService.deleteStagiaire(id).subscribe(() => {
          this.listStagiaires = this.listStagiaires.filter(s => s.id !==id);
        })
      }
    }
}
