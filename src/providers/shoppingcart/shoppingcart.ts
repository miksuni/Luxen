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
  productsInCart = 0;
  totalSum = 0;
  
  constructor(public http: HttpClient) {
    console.log('Hello ShoppingcartProvider Provider');
  }
  
  addProduct(productInfo) {
      console.log('>> ShoppingcartProvider.addProduct');
      productInfo.quantity = 1;
      productInfo.total = productInfo.price;
      productInfo.totalAsString = productInfo.total.toFixed(2);
      productInfo.priceAsString = productInfo.price.toFixed(2);
      this.shoppingCart.push(productInfo);
      this.productsInCart++;
      this.totalSum += productInfo.price;
      console.log('>> cart content: ' + JSON.stringify(this.shoppingCart));
  }
  
  removeProduct(i) {
      console.log('>> ShoppingcartProvider.removeProduct');
      if (i >= 0 && i < this.shoppingCart.length) {
          this.productsInCart -= this.shoppingCart[i].quantity;
          this.totalSum -= (this.shoppingCart[i].price * this.shoppingCart[i].quantity);
          this.shoppingCart.splice(i, 1);
      }
      return this.shoppingCart;
  }

  clearAll() {
    console.log('>> ShoppingcartProvider.clearAll');
    this.shoppingCart.splice(0,this.shoppingCart.length);
    this.productsInCart = 0;
    this.totalSum = 0;
  }

  increase(i) {
    console.log('>> ShoppingcartProvider.increase');
    this.shoppingCart[i].quantity++;
    this.shoppingCart[i].total += this.shoppingCart[i].price;
    this.shoppingCart[i].totalAsString = this.shoppingCart[i].total.toFixed(2);
    this.productsInCart++;
    this.totalSum += this.shoppingCart[i].price;
  }

  decrease(i) {
      console.log('ShoppingcartProvider.decrease');
      this.productsInCart--;
      this.totalSum -= this.shoppingCart[i].price;
      if (this.shoppingCart[i].quantity > 1) {
        this.shoppingCart[i].quantity--;
        this.shoppingCart[i].total -= this.shoppingCart[i].price;
        this.shoppingCart[i].totalAsString = this.shoppingCart[i].total.toFixed(2);
      } else {
        this.shoppingCart.splice(i, 1);
      }
  }
  
  getProducts() {
      console.log('>> ShoppingcartProvider.getProducts');
      return this.shoppingCart;
  }
}
