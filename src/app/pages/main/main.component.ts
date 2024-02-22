import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: false,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit {
  constructor(private _router: Router, private _route: ActivatedRoute) {
    const token = atob(
      this._router
        .getCurrentNavigation()
        ?.initialUrl.queryParamMap.get('token') as string
    );

    localStorage.setItem('token', token);
  }

  ngOnInit(): void {
    this._router.navigate(['home'], { relativeTo: this._route });
  }
}
