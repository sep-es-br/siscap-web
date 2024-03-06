import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-person-form',
  standalone: false,
  templateUrl: './person-form.component.html',
  styleUrl: './person-form.component.css',
})
export class PersonFormComponent implements OnInit {
  public loading: boolean = false;

  public uploadedPhoto!: any;

  public placeholderList: Array<{ id: number; label: string }> = [];

  constructor() {}

  // ngOnChanges(changes: SimpleChanges): void {
  //     console.log(changes)
  // }

  // Not allowed to load local resource: file:///C:/fakepath/eu.jpeg

  ngOnInit(): void {
    console.log(this.uploadedPhoto);
    console.log(typeof this.uploadedPhoto);
  }

  test() {
    console.log(this.uploadedPhoto);
    console.log(typeof this.uploadedPhoto);
  }
}
