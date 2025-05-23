import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StagiaireFormComponent } from './components/stagiaire-form/stagiaire-form.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StagiaireFormComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'app-gestion-stagiaire';
}
