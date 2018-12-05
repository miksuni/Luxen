import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProductUpdatePage } from './productUpdate';

@NgModule({
  declarations: [
    ProductUpdatePage,
  ],
  imports: [
    IonicPageModule.forChild(ProductUpdatePage),
  ],
})
export class ProductUpdatePageModule {}