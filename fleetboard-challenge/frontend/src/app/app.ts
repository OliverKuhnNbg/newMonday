// src/app/app.ts (oder app.component.ts)
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`, // Rendert unsere routbaren Features
})
// ACHTUNG: Hier muss der Name mit dem Import in der main.ts übereinstimmen!
export class App {}
