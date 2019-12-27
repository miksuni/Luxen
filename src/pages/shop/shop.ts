import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProductList } from '../../providers/productlist/productlist';
import { ShoppingcartProvider } from '../../providers/shoppingcart/shoppingcart';

/**
 * Generated class for the ShopPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shop',
  templateUrl: 'shop.html',
})
export class ShopPage {
    
  productObject: string ="";
  productNumber: string = "";
  productName: string = "";
  productNumberInitials: string = "";
  productNameInitials: string = "";
  price: string = "";
  amountInStock: string = "";
  inProductionInfo: string = "";
    
  cartContent = [];
  searchResult: any;
  
  productInfo = { objectId:'', ISBN:'', productName:'', price:'', amountInStock:'', productCode:'', availableFromPublisher:'' };
  productsInCart = 0;
  totalSum: number = 0;
  //totalSum = 0;

  givenAmount = 0;
  cashBack = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, public productList: ProductList, private shoppingCart: ShoppingcartProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShopPage');
    document.getElementById("cashback_fields").style.visibility = "hidden";
    document.getElementById("card_payment_guide").style.visibility = "hidden";
    this.productList.getProductInfo();
    this.cartContent = this.shoppingCart.getProducts();
    this.update();
  }
  
  clear() {
      this.productNumber = "";
      this.productName = "";
      this.price = "";
      this.amountInStock = "";
      this.inProductionInfo = "";
    }
  
  onProductNumberUpdated() {
      console.log('>> shop.onProductNumberUpdated: ' + this.productNumberInitials);
      if (this.productNumberInitials.length > 0) {
          var found = this.productList.getProductProgressivelyByNumber(this.productNumberInitials);
          this.searchResult = found;
          console.log('>> found: ' + found.length);
          console.log('>> json: ' + JSON.stringify(found));
          this.clear();
          if (this.searchResult.length == 1) {
              console.log('>> found item: ' + found[0].productName);
              this.showProduct(found[0]);
          }
      }
  }

  onProductNameUpdated() {
      console.log('>> shop.onProductNameUpdated: ' + this.productNameInitials);
      var found = this.productList.getProductByName(this.productNameInitials);
      this.searchResult = found;
      console.log('>> found: ' + found.length);
      console.log('>> json: ' + JSON.stringify(found));
      this.clear();
      //if (found.length == 1) {
      //    console.log('>> found item: ' + found[0].productName);
      //    this.showProduct(found[0]);
      //}
  }
  
  onProductSelected(productName, index) {
      console.log('>> shop.onProductSelected: ' + productName + ' index: ' + index);
      this.showProduct(this.searchResult[index]);
      this.searchResult.splice(0,this.searchResult.length)
    }

  addToShoppingCart(productInfo) {
      this.shoppingCart.addProduct(productInfo);
      //productInfo.price = productInfo.price.toFixed(2);
      this.update();
      //this.cartContent = this.shoppingCart.getProducts();
  }
  
  showProduct(productInfo) {
      console.log('>> shop.showProduct: ' + JSON.stringify(productInfo));
      this.addToShoppingCart(productInfo);
      this.productInfo = productInfo;
      this.productNumber = productInfo.ISBN;
      this.productName = productInfo.productName;
      this.price = productInfo.price;
      this.amountInStock = productInfo.amountInStock;
      if (!productInfo.availableFromPublisher) {
          this.inProductionInfo = "(Poistunut tuote)";
      } else {
          this.inProductionInfo = "";
      }
  }

  onGivenAmountUpdated() {
    console.log('>> shop.onGivenAmountUpdated');
    this.cashBack = this.givenAmount - this.totalSum;
  }

  removeProduct(productName, i) {
    console.log('removeFromCart: ' + productName + ", index: " + i);
    this.shoppingCart.removeProduct(i);
    this.update();
  }

  increase(productName, i) {
      console.log('increase: ' + productName + ", index: " + i);
      this.shoppingCart.increase(i);
      this.update();
  }

  decrease(productName, i) {
      console.log('decrease: ' + productName + ", index: " + i);
      this.shoppingCart.decrease(i);
      this.update();
  }

  cardPayment() {
    console.log('cardPayment');
    document.getElementById("cashback_fields").style.visibility = "hidden";
    document.getElementById("card_payment_guide").style.visibility = "visible";
  }

  confirmCardPayment() {
    console.log('confirmCardPayment');
  }

  cashPayment() {
    console.log('cashPayment');
    document.getElementById("cashback_fields").style.visibility = "visible";
    document.getElementById("card_payment_guide").style.visibility = "hidden";
  }

  update() {
    console.log('update');
    this.productsInCart = this.shoppingCart.productsInCart;
    this.totalSum = this.shoppingCart.totalSum.toFixed(2);
    if (this.totalSum > 0) {
      //document.getElementById("card_button").disabled=false;
      //document.getElementById("cash_button").disabled=false;
    } else {
      //document.getElementById("card_button").disabled=true;
      //document.getElementById("cash_button").disabled=true;
      document.getElementById("cashback_fields").style.visibility = "hidden";
      document.getElementById("card_payment_guide").style.visibility = "hidden";
    }
  }
}
