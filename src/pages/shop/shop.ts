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
  receiptContent = [];
  searchResult: any;
  
  productInfo = { objectId:'', ISBN:'', productName:'', price:'', amountInStock:'', productCode:'', availableFromPublisher:'' };
  productsInCart = 0;
  totalSum: number = 0;
  totalSumAsString: string = "";

  givenAmount = 0;
  cashBack = 0;

  cardPaymentEnabled: boolean = false;
  cashPaymentEnabled: boolean = false;
  confirmButtonsEnabled: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public productList: ProductList, private shoppingCart: ShoppingcartProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShopPage');
    document.getElementById("card_payment_guide").style.visibility = "hidden";
    document.getElementById("cash_payment_guide").style.visibility = "hidden";
    document.getElementById("receipt_view").style.visibility = "hidden";
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
  }
  
  onProductSelected(productName, index) {
      console.log('>> shop.onProductSelected: ' + productName + ' index: ' + index);
      this.showProduct(this.searchResult[index]);
      this.searchResult.splice(0,this.searchResult.length)
    }

  addToShoppingCart(productInfo) {
      this.shoppingCart.addProduct(productInfo);
      this.update();
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
    document.getElementById("card_payment_guide").style.visibility = "visible";
    document.getElementById("cash_payment_guide").style.visibility = "hidden";
    this.confirmButtonsEnabled = true;
  }

  confirmPayment() {
    console.log('confirmPayment');
    this.receiptContent = Array.from(this.cartContent);
    //this.cartContent.splice(0,this.cartContent.length);
    this.shoppingCart.clearAll();
    this.update();
    document.getElementById("receipt_view").style.visibility = "visible";
    this.cardPaymentEnabled = false;
    this.cashPaymentEnabled = false;
    this.confirmButtonsEnabled = false;
  }

  cancelPurchase() {
    console.log('cancelPurchase');
    document.getElementById("receipt_view").style.visibility = "hidden";
    this.shoppingCart.clearAll();
    this.update();
  }

  cashPayment() {
    console.log('cashPayment');
    document.getElementById("card_payment_guide").style.visibility = "hidden";
    document.getElementById("cash_payment_guide").style.visibility = "visible";
    this.confirmButtonsEnabled = true;
  }

  checkIfCardPaymentEnabled() {
    console.log('checkIfCardPaymentEnabled');
    return !this.cardPaymentEnabled;
  }

  checkIfCashPaymentEnabled() {
    console.log('checkIfCashPaymentEnabled');
    return !this.cardPaymentEnabled;
  }

  checkIfConfirmButtonsEnabled() {
    console.log('checkIfConfirmButtonsEnabled');
    return !this.confirmButtonsEnabled;
  }

  update() {
    console.log('update');
    this.productsInCart = this.shoppingCart.productsInCart;
    this.totalSum = this.shoppingCart.totalSum;
    this.totalSumAsString = this.shoppingCart.totalSum.toFixed(2);
    if (this.totalSum > 0) {
      this.cardPaymentEnabled = true;
      this.cashPaymentEnabled = true;
    } else {
      this.cardPaymentEnabled = false;
      this.cashPaymentEnabled = false;
      this.confirmButtonsEnabled = false;
      //document.getElementById("cashback_fields").style.visibility = "hidden";
      document.getElementById("card_payment_guide").style.visibility = "hidden";
      document.getElementById("cash_payment_guide").style.visibility = "hidden";
    }
  }
}
