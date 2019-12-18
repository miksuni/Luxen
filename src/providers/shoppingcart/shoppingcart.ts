import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ShoppingcartProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ShoppingcartProvider {

  productInfoStr: any;
  //productInfo = { objectId:'', ISBN:'', productName:'', price:'', amountInStock:'', productCode:'', availableFromPublisher:'', amount:'' };
  shoppingCart = [];
  
  constructor(public http: HttpClient) {
    console.log('Hello ShoppingcartProvider Provider');
  }
  
  addProduct(productInfo) {
      //var productLine =  {a:''};
      console.log('>> ShoppingcartProvider.showProduct');
      productInfo.quantity = 1;
      this.shoppingCart.push(productInfo);
      console.log('>> cart content: ' + JSON.stringify(this.shoppingCart));
  }
  
  removeProduct(index) {
      if (index >= 0 && index < this.shoppingCart.length) {
          this.shoppingCart.splice(index, 1);
      }
      return this.shoppingCart;
  }
  
  getProducts() {
      return this.shoppingCart;
  }
}
