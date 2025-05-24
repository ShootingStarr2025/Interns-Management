import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StagiaireService {
  private apiUrl = "http://localhost:3000/stagiaires"

  constructor(private http: HttpClient) {}
  addStagiaire(stagiaire:any):Observable<any> {
    return this.http.post<any>(this.apiUrl,stagiaire);
  }
}
