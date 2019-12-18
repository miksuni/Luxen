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
    
  constructor(public navCtrl: NavController, public navParams: NavParams, private shoppingCart: ShoppingcartProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShoppingCartPage');
    //cartContent = 
    this.cartContent = this.shoppingCart.getProducts();
  }
  
  onProductSelected(productName, i) {
    console.log('onProductSelected: ' + productName + ", index: " + i);
  }
  
  removeFromCart(productName, i) {
    console.log('removeFromCart: ' + productName + ", index: " + i);
    this.cartContent.splice(i, 1);
  }
  
  increase(productName, i) {
      console.log('increase: ' + productName + ", index: " + i);
      this.cartContent[i]
  }
  
  decrease(productName, i) {
      console.log('decrease: ' + productName + ", index: " + i);
  }
}
