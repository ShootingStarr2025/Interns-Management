import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StagiaireService {
  private apiUrl = 'http://localhost:3000/stagiaires'; // Stagiaires full list

  // Add new intern / new stagiaire
  constructor(private http: HttpClient) {}

  addStagiaire(stagiaire: any): Observable<any> {
    console.log('📤 Sending stagiaire to backend:', stagiaire); // ✅ See if image is included
    return this.http.post<any>(this.apiUrl, stagiaire);
  }

  // fetch all interns / stagiaires
  getStagiaires(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Check for existing email
  emailExists(email: string) {
    return this.http.get<any[]>(`${this.apiUrl}?email=${email}`).pipe(
      tap((res) => console.log('req:', res)),
      map((response) => {
        const hasStagiaire = response.find((s) => s.email === email);
        console.log('s?', hasStagiaire);
        return hasStagiaire ? true : false;
      })
    );
  }

  //Get intern / Stagiaire ID fetch a specific intern / stagiaire
  getStagiaireById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Update - Edit existing stagiaire by ID
  updateStagiaire(id: string, stagiaire: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, stagiaire);
  }

  // Delete - remove intern / Stagiaire By Id
  deleteStagiaire(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
