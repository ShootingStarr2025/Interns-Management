import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/stagiaire-list/stagiaire-list.component').then(
        (m) => m.StagiaireListComponent
      ),
  },

  {
    path: 'add',
    loadComponent: () =>
      import('./components/stagiaire-form/stagiaire-form.component').then(
        (m) => m.StagiaireFormComponent
      ),
  },

  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./components/stagiaire-edit/stagiaire-edit.component').then(
        (m) => m.StagiaireEditComponent
      ),
  },

  {
    path: 'stagiaireinfo/:id',
    loadComponent: async () => {
      const module = await import('./components/viewlist/viewlist.component');
      return module.ViewlistComponent;
    },
  },
];
