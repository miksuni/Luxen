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
  inProductionInfo: string = "";

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
    //this.productInfo.inProductionInfo = this.inProductionInfo;
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
    console.log('>> found: ' + found.length);
    console.log('>> json: ' + JSON.stringify(found));
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
    console.log('>> found: ' + found.length);
    console.log('>> json: ' + JSON.stringify(found));
    this.clear();
    if (found.length == 1) {
      console.log('>> found item: ' + found[0].productName);
      this.showProduct(found[0]);
    }
  }

  onProductSelected(productName, index) {
    console.log('>> productUpdate.onProductSelected: ' + productName + ' index: ' + index);
    //this.productName = productName;
    this.productNumber = this.searchResult[index].ISBN;
    this.productName = this.searchResult[index].productName;
    this.price = this.searchResult[index].price;
    this.amountInStock = this.searchResult[index].amountInStock;
    if (!this.searchResult[index].availableFromPublisher) {
      this.inProductionInfo = "(Poistunut tuote)";
    } else {
      this.inProductionInfo = "";
    }
  }

  showProduct(productInfo) {
      this.productNumber = productInfo.ISBN + " : " +  productInfo.objectId;
      this.productName = productInfo.productName;
      this.price = productInfo.price;
      this.amountInStock = productInfo.amountInStock;
      if (!productInfo.availableFromPublisher) {
        this.inProductionInfo = "(Poistunut tuote)";
      } else {
        this.inProductionInfo = "";
      }
      console.log('>> ' + JSON.stringify(productInfo));
  }

  clear() {
    this.productNumber = "";
    this.productName = "";
    this.price = "";
    this.amountInStock = "";
    this.inProductionInfo = "";
    this.objectId = "";
  }
}
