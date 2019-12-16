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
  productInfo = { objectId:'', ISBN:'', productName:'', price:'', amountInStock:'', productCode:'', availableFromPublisher:'' };
  shoppingCart = [];
  
  constructor(public http: HttpClient) {
    console.log('Hello ShoppingcartProvider Provider');
  }
  
  addProduct(productInfo) {
      var shoppingCart = [];
      console.log('>> ShoppingcartProvider.showProduct');
      shoppingCart.push(productInfo);
      this.shoppingCart.push(productInfo);
      console.log('>> cart content: ' + JSON.stringify(this.shoppingCart));
      //this.objectId = productInfo.objectId;
      //this.productNumber = productInfo.ISBN;
      //this.productName = productInfo.productName;
      //this.price = productInfo.price;
      //this.amountInStock = productInfo.amountInStock;
      //this.inProduction = productInfo.availableFromPublisher;
      //console.log('>> ' + JSON.stringify(productInfo));
  }
}
