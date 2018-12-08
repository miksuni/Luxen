import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ProductList } from '../../providers/productlist/productlist';
import { HttpClient } from '@angular/common/http';
import { RestProvider } from '../../providers/rest/rest';

@Component({
  selector: 'page-productUpdate',
  templateUrl: 'productUpdate.html'
})
export class ProductUpdatePage {

  productNumber: string = "";
  productName: string = "";
  price: string = "";
  amountInStock: string = "";
  inProduction: boolean = false;

  objectId: string = "";

  productNumberInitials: string = "";
  productNameInitials: string = "";

  searchResult: any;

  productInfoStr: any;
  productInfo = { objectId:'', ISBN:'', productName:'', price:'', amountInStock:'', productCode:'', availableFromPublisher:'' };

  constructor(public navCtrl: NavController, private barcodeScanner: BarcodeScanner, public productList: ProductList, public httpClient: HttpClient, public restProvider: RestProvider) {
    console.log('>> productUpdate.constructor');
  }

  saveProducts() {
    console.log('>> home.saveProducts');
    this.productList.updateProductInfo
  }

  saveProduct() {
    this.productInfo.objectId = this.objectId;
    //this.productInfo.ISBN = this.productNumber;
    //this.productInfo.productName = this.productName;
    this.productInfo.price = this.price;
    this.productInfo.amountInStock = this.amountInStock;
    this.productInfo.availableFromPublisher = this.inProduction ? "true" : "false";
    console.log('>> home.saveProduct ' + JSON. stringify(this.productInfo));
    this.productList.updateProductInfo(this.productInfo);
  }

  readProduct() {
    console.log('>> productUpdate.readProduct');
    this.clear();
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.productNumber = barcodeData.text;
      this.showProduct( this.productList.getProductByNumber(this.productNumber));
    }).catch(err => {
      console.log('Error', err);
    });
  }

  onProductNumberUpdated() {
    console.log('>> productUpdate.onProductNumberUpdated: ' + this.productNumberInitials);
    var found = this.productList.getProductProgressivelyByNumber(this.productNumberInitials);
    this.searchResult = found;
    //console.log('>> found: ' + found.length);
    //console.log('>> json: ' + JSON.stringify(found));
    this.clear();
    if (this.searchResult.length == 1) {
      console.log('>> found item: ' + found[0].productName);
      this.showProduct(found[0]);
    }
  }

  onProductNameUpdated() {
    console.log('>> productUpdate.onProductNameUpdated: ' + this.productNameInitials);
    var found = this.productList.getProductByName(this.productNameInitials);
    this.searchResult = found;
    //console.log('>> found: ' + found.length);
    //console.log('>> json: ' + JSON.stringify(found));
    this.clear();
    if (found.length == 1) {
      console.log('>> found item: ' + found[0].productName);
      this.showProduct(found[0]);
    }
  }

  onProductSelected(productName, index) {
    console.log('>> productUpdate.onProductSelected: ' + productName + ' index: ' + index + ' obj: ' + this.searchResult[index].objectId);
    //this.productName = productName;
    this.objectId = this.searchResult[index].objectId;
    this.productNumber = this.searchResult[index].ISBN;
    this.productName = this.searchResult[index].productName;
    this.price = this.searchResult[index].price;
    this.amountInStock = this.searchResult[index].amountInStock;
    this.inProduction = this.searchResult[index].availableFromPublisher;
  }

  showProduct(productInfo) {
      console.log('>> productUpdate.showProduct: ' + productInfo.objectId);
      this.objectId = productInfo.objectId;
      this.productNumber = productInfo.ISBN;
      this.productName = productInfo.productName;
      this.price = productInfo.price;
      this.amountInStock = productInfo.amountInStock;
      this.inProduction = productInfo.availableFromPublisher;
      console.log('>> ' + JSON.stringify(productInfo));
  }

  increasePrice() {
    console.log('>> productUpdate.increasePrice, current price ' + this.price);
    var tmpStr = this.price.toString();
    if (tmpStr.length > 0) {
      var price = parseInt(tmpStr, 10);
      price++;
      this.price = price.toString();
    }
  }

  reducePrice() {
    console.log('>> productUpdate.increasePrice, current price ' + this.price);
    var tmpStr = this.price.toString();
    if (tmpStr.length > 0) {
      var price = parseInt(tmpStr, 10);
      if (price > 0) {
        price--;
        this.price = price.toString();
      }
    }
  }

  increaseAmount() {
    console.log('>> productUpdate.increaseAmount, current amountInStock ' + this.amountInStock);
    var tmpStr = this.amountInStock.toString();
    if (tmpStr.length > 0) {
      var amountInStock = parseInt(tmpStr, 10);
      amountInStock++;
      this.amountInStock = amountInStock.toString();
    }
  }

  reduceAmount() {
    console.log('>> productUpdate.reduceAmount, current amountInStock ' + this.amountInStock);
    var tmpStr = this.amountInStock.toString();
    if (tmpStr.length > 0) {
      var amountInStock = parseInt(tmpStr, 10);
      if (amountInStock > 0) {
        amountInStock--;
        this.amountInStock = amountInStock.toString();
      }
    }
  }

  inProductionChanged() {
    console.log('>> productUpdate.inProductionChanged, new value: ' + this.inProduction);
  }

  clear() {
    this.productNumber = "";
    this.productName = "";
    this.price = "";
    this.amountInStock = "";
    this.inProduction = false;
    this.objectId = "";
  }
}
