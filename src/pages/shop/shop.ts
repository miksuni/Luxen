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

  constructor(public navCtrl: NavController, public navParams: NavParams, public productList: ProductList, private shoppingCart: ShoppingcartProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShopPage');
    this.productList.getProductInfo();
    this.cartContent = this.shoppingCart.getProducts();
  }
  
  clear() {
      this.productNumber = "";
      this.productName = "";
      this.price = "";
      this.amountInStock = "";
      this.inProductionInfo = "";
    }
  
  onProductNumberUpdated() {
      console.log('>> home.onProductNumberUpdated: ' + this.productNumberInitials);
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
      console.log('>> home.onProductNameUpdated: ' + this.productNameInitials);
      var found = this.productList.getProductByName(this.productNameInitials);
      this.searchResult = found;
      console.log('>> found: ' + found.length);
      console.log('>> json: ' + JSON.stringify(found));
      this.clear();
      if (found.length == 1) {
          console.log('>> found item: ' + found[0].productName);
          this.showProduct(found[0]);
      }
  }
  
  onProductSelected(productName, index) {
      console.log('>> home.onProductSelected: ' + productName + ' index: ' + index);
      this.showProduct(this.searchResult[index]);
      this.searchResult.splice(0,this.searchResult.length)
    }

  addToShoppingCart(productInfo) {
      this.shoppingCart.addProduct(productInfo);
      //this.cartContent = this.shoppingCart.getProducts();
  }
  
  showProduct(productInfo) {
      console.log('>> home.showProduct: ' + JSON.stringify(productInfo));
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
}
