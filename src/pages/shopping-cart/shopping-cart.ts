import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ShoppingcartProvider } from '../../providers/shoppingcart/shoppingcart';

/**
 * Generated class for the ShoppingCartPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shopping-cart',
  templateUrl: 'shopping-cart.html',
})
export class ShoppingCartPage {
    
  //productInfo = { objectId:'', ISBN:'', productName:'', price:'', amountInStock:'', productCode:'', availableFromPublisher:'' };
  cartContent = [];
  productsInCart = 0;
  totalSum = 0;
    
  constructor(public navCtrl: NavController, public navParams: NavParams, private shoppingCart: ShoppingcartProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShoppingCartPage');
    this.cartContent = this.shoppingCart.getProducts();
    this.productsInCart = this.shoppingCart.productsInCart;
  }
  
  onProductSelected(productName, i) {
    console.log('onProductSelected: ' + productName + ", index: " + i);
  }
  
  removeProduct(productName, i) {
    console.log('removeFromCart: ' + productName + ", index: " + i);
    this.shoppingCart.removeProduct(i);
    this.productsInCart = this.shoppingCart.productsInCart;
  }
  
  increase(productName, i) {
      console.log('increase: ' + productName + ", index: " + i);
      this.shoppingCart.increase(i);
      this.productsInCart = this.shoppingCart.productsInCart;
  }
  
  decrease(productName, i) {
      console.log('decrease: ' + productName + ", index: " + i);
      this.shoppingCart.decrease(i);
      this.productsInCart = this.shoppingCart.productsInCart;
  }
}
