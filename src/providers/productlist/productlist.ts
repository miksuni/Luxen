//import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RestProvider } from '../../providers/rest/rest';

/*
  Generated class for the ProductList provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ProductList {

    emptyProduct = JSON.parse('{"ISBN":"","Tuotenro":"","Tuote":"Tuotetta ei varastossa","Kpl":"0","Hinta":"", "Tilattavissa":"True"}');
    nullProduct = JSON.parse('[]');

	productInfoStr: any;
	productInfo: any;
	//productInfo = {ISBN:'', productCode:'', productName:'', amountInStock:'', price:'', availableFromPublisher:'', createdAt:'', updatedAt:'', objectId:''};

	constructor( public httpClient: HttpClient, public restProvider: RestProvider) {
		console.log('Hello ProductList Provider');
		this.getProductInfo();
	}


	getProductInfo() {
		console.log('>> productList.getProductInfo');
		this.restProvider.productInfo("").then((result:any) => {
			this.productInfoStr = result.result;
			//console.log(">> productInfo as string: " + this.productInfoStr);
			this.productInfo = JSON.parse(this.productInfoStr);
			//console.log(">> productInfo as len: " + this.productInfo.length);
		}, (err) => {
      		console.log(err);
    	});
  	}

	getProductByNumber(isbnNumber) {
		for (var i = 0; i < this.productInfo.length; i++) {
			if (isbnNumber == this.productInfo[i].ISBN.replace(/-/g,'')) {
				console.log('>> found');
				return this.productInfo[i];
			}
 		}
		return this.emptyProduct;
	}


	getProductProgressivelyByNumber(letters) {
		if (letters.length == 0) {
			return this.nullProduct;
		}
		console.log('>> ProductList.getProductByNumber');
		var results = [];
		//console.log('>> LEN ' + this.productInfo.length);
		for (var i = 0; i < this.productInfo.length; i++) {
			if (this.productInfo[i].ISBN.replace(/-/g,'').startsWith(letters)) {
				//console.log('>> candicate found');
				//console.log('>> ISBN: ' + this.productInfo[i].ISBN);
				//console.log('>> product code: ' + this.productInfo[i].ISBN.replace(/-/g,''));
				results.push(this.productInfo[i]);
			}
		}
		return results;
	}

	getProductByName(letters) {
		if (letters.length == 0) {
			return this.nullProduct;
		}
		console.log('>> ProductList.getProductByName');
		var results = [];
		//console.log('>> LEN ' + this.productInfo.length);
		for (var i = 0; i < this.productInfo.length; i++) {
			if (this.productInfo[i].productName.toLowerCase().startsWith(letters.toLowerCase())) {
				//console.log('>> candicate found');
				//console.log('>> ISBN: ' + this.productInfo[i].ISBN);
				//console.log('>> product code: ' + this.productInfo[i].ISBN.replace(/-/g,''));
				results.push(this.productInfo[i]);
			}
		}
		return results;
	}

	getProductByIndex(index) {
		console.log('>> ProductList.getProductByIndex');
		//if (index < this.productList.length) {
		//	return this.productList[index];
		//}
		//return this.nullProduct;
	}

	getProductCount() {
		//return this.productList.length;
	}

	updateProductInfo(updatedInfo) {
		this.restProvider.saveProduct(updatedInfo).then((result:any) => {
			console.log(">> product info saved");
			//this.getProductInfo();
		}, (err) => {
			console.log(err);
		});
	}
}
