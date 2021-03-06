import { Routes } from '@angular/router';
import { ViewItemsComponent } from './view-items/view-items.component';
import { AddItemComponent } from './add-item/add-item.component';

export const itemRoutes: Routes = [
    { path: '', component: ViewItemsComponent },
    { path: 'items', component: ViewItemsComponent },
    { path: 'add-item', component: AddItemComponent },
    { path: 'edit-item/:id', component: AddItemComponent },
];
