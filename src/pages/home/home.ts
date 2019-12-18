import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ProductList } from '../../providers/productlist/productlist';
import { ShoppingcartProvider } from '../../providers/shoppingcart/shoppingcart';
import { HttpClient } from '@angular/common/http';
import { RestProvider } from '../../providers/rest/rest';
import { LoadingController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  productObject: string ="";
  productNumber: string = "";
  productName: string = "";
  productNumberInitials: string = "";
  productNameInitials: string = "";
  price: string = "";
  amountInStock: string = "";
  inProductionInfo: string = "";
  //searchResult = []; //*-* Chrome
  searchResult: any; //*-* Android

  loadingIndicator: any;

  productInfo = { objectId:'', ISBN:'', productName:'', price:'', amountInStock:'', productCode:'', availableFromPublisher:'' };

  constructor(public navCtrl: NavController, 
              private barcodeScanner: BarcodeScanner,
              public productList: ProductList, 
              public httpClient: HttpClient, 
              public restProvider: RestProvider,
              public loadingCtrl: LoadingController,
              public shoppingCart: ShoppingcartProvider) {
	console.log('>> home.constructor');
	//this.presentLoading();
	this.productList.getProductInfo();
	//this.finishLoading();
  }

  saveProducts() {
	console.log('>> home.saveProducts');
	//var productCount = this.productList.getProductCount();
	//for (var i = 0; i < productCount; i++) {
	//  this.restProvider.addProduct(this.productList.getProductByIndex(i));
	//}
  }

  readProduct() {
	console.log('>> home.readProduct');
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
	/*this.productInfo = this.searchResult[index];
	this.productNumber = this.searchResult[index].ISBN;
	this.productName = this.searchResult[index].productName;
	this.price = this.searchResult[index].price;
	this.amountInStock = this.searchResult[index].amountInStock;
	if (!this.searchResult[index].availableFromPublisher) {
	  this.inProductionInfo = "(Poistunut tuote)";
	} else {
	  this.inProductionInfo = "";
	}*/
	this.showProduct(this.searchResult[index]);
  }

  showProduct(productInfo) {
      console.log('>> home.showProduct: ' + JSON.stringify(productInfo));
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

	addToShoppingCart() {
        this.shoppingCart.addProduct(this.productInfo);
	}

	goToShoppingCart() {
		console.log('>> home.goToShoppingCart');
		this.navCtrl.push('ShoppingCartPage', {});
	}

  clear() {
	this.productNumber = "";
	this.productName = "";
	this.price = "";
	this.amountInStock = "";
	this.inProductionInfo = "";
  }

	presentLoading() {
		this.loadingIndicator = this.loadingCtrl.create({
			content: "Haetaan tuotteet..."
			//duration: 3000;
		});
		this.loadingIndicator.present();
	}

	finishLoading() {
		this.loadingIndicator.dismiss();
	}
}
