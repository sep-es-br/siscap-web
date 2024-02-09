import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent {
  constructor(private _router: Router) {}

  redirectNewProject() {
    this._router.navigateByUrl('/projects/create');
  }

  queryProject() {}
}
