import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule,CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  navLists = [
    {
      path: "",
      label: "Home"
    },
    {
      path: "add",
      label: "Add a Trainee"
    },
    {
      path: "Contact",
      label: "Contact Us"
    },
    {
      path: "Aboutme",
      label: "About Me"
    }
    
  ]
}
