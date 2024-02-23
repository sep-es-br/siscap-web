import { Component } from '@angular/core';
import { EventType, NavigationEnd, Router } from '@angular/router';
import { filter, map, tap } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  standalone: false,
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  private breadcrumbNav: Array<string> = [];

  constructor(private _router: Router) {
    this._router.events
      .pipe(
        filter((event) => {
          return event.type == EventType.NavigationEnd;
        })
      )
      .subscribe(() => {
        const currentNav = this._router
          .getCurrentNavigation()
          ?.extractedUrl.root.children['primary'].segments.filter((segment) => {
            return segment.path != 'main' && segment.path != 'home';
          });
        currentNav?.forEach((segment) => !this.breadcrumbNav.includes(segment.path) ? this.breadcrumbNav.push(segment.path)  : null);
        console.log(this.breadcrumbNav);
        // console.log(currentNav);
      });
  }

  navigateHome() {
    // this._router.navigate([`${route}`], { relativeTo: this._route });
    this._router.navigateByUrl('/main/home');
  }
}
