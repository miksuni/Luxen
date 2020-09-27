import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ProductList } from '../../providers/productlist/productlist';
import { HttpClient } from '@angular/common/http';
import { RestProvider } from '../../providers/rest/rest';
import { LoadingController } from 'ionic-angular';

@Component( {
    selector: 'page-productUpdate',
    templateUrl: 'productUpdate.html'
} )
export class ProductUpdatePage {

    productNumber: string = "";
    productName: string = "";
    productCode: string = "";
    price: string = "";
    amountInStock: string = "";
    inProduction: boolean = false;
    inventoryCorrection: boolean = false;

    objectId: string = "";

    productNumberInitials: string = "";
    productNameInitials: string = "";

    searchResult: any;

    loadingIndicator: any;

    productUpdates: any;

    //productInfoStr: any;
    productInfo = { objectId: '', ISBN: '', productName: '', price: '', amountInStock: '', productCode: '', availableFromPublisher: false, inventoryCorrection: false };

    constructor( public navCtrl: NavController,
        private barcodeScanner: BarcodeScanner,
        public productList: ProductList,
        public httpClient: HttpClient,
        public restProvider: RestProvider,
        public loadingCtrl: LoadingController ) {
        console.log( '>> productUpdate.constructor' );
    }

    ionViewDidLoad() {
        console.log( 'ionViewDidLoad ProductUpdate' );
        this.productList.getProductInfo();
    }

    saveProduct() {
        this.presentLoading();
        this.productInfo.objectId = this.objectId;
        //this.productInfo.ISBN = this.productNumber;
        //this.productInfo.productName = this.productName;
        this.productInfo.price = this.price;
        this.productInfo.amountInStock = this.amountInStock;
        this.productInfo.availableFromPublisher = this.inProduction;
        this.productInfo.inventoryCorrection = this.inventoryCorrection;
        console.log( '>> home.saveProduct ' + JSON.stringify( this.productInfo ) );
        this.productList.updateProductInfo( this.productInfo );
        setTimeout(() => {
            console.log( '>> timeout ends' );
            this.inventoryCorrection = false;
            this.productList.getProductInfo();
            this.finishLoading();
        }, 3000 );
    }

    readProduct() {
        console.log( '>> productUpdate.readProduct' );
        this.clear();
        this.barcodeScanner.scan().then( barcodeData => {
            console.log( 'Barcode data', barcodeData );
            this.productNumber = barcodeData.text;
            this.showProduct( this.productList.getProductByNumber( this.productNumber ) );
        } ).catch( err => {
            console.log( 'Error', err );
        } );
    }

    addProduct() {
        console.log( '>> productUpdate.addProduct' );
        this.presentLoading();
        this.productInfo.objectId = "";
        this.productInfo.productName = this.productNameInitials;
        this.productInfo.ISBN = this.productNumberInitials;
        this.productInfo.productCode = this.productCode;
        this.productInfo.price = this.price;
        this.productInfo.amountInStock = this.amountInStock;
        this.productInfo.availableFromPublisher = this.inProduction;
        console.log( '>> productUpdate.product to be added: ' + JSON.stringify( this.productInfo ) );
        this.productList.addProduct( this.productInfo );
        setTimeout(() => {
            console.log( '>> timeout ends' );
            this.productList.getProductInfo();
            this.finishLoading();
        }, 3000 );
    }

    sleep( ms ) {
        return new Promise( resolve => setTimeout( resolve, ms ) );
    }

    async addProducts( data ) {
        //console.log( data );
        this.productUpdates = JSON.parse( data );
        //console.log( this.productUpdates );
        //console.log( JSON.stringify( this.productUpdates ) );
        console.log( '>> product count: ' + this.productUpdates.length );
        for ( var i = 0; i < this.productUpdates.length; i++ ) {
            var productInfo = { productName: "", price: 0, amountInStock: 0, availableFromPublisher: false };
            productInfo.productName = this.productUpdates[i].productName;
            productInfo.price = this.productUpdates[i].price;
            productInfo.amountInStock = this.productUpdates[i].amountInStock;
            productInfo.availableFromPublisher = this.productUpdates[i].availableFromPublisher;
            this.productList.addProduct( productInfo );
            console.log( '>> ' + i + JSON.stringify( productInfo ) );
            await this.sleep( 2000 );
        }
    }

    getUpdates() {
        this.httpClient
            .get( '../../assets/data/products.json', {
                responseType: 'text'
            } )
            .subscribe(
            data => this.addProducts( data ),
            err => console.log( 'something went wrong: ', err )
            );
    }

    importProducts() {
        console.log( '>> productUpdate.importProducts' );
        this.getUpdates();
    }

    removeProduct() {
        console.log( '>> productUpdate.removeProduct' );
        this.presentLoading();
        this.productInfo.objectId = this.objectId;
        console.log( '>> productUpdate.product to be removed: ' + JSON.stringify( this.productInfo ) );
        this.productList.removeProduct( this.productInfo );
        setTimeout(() => {
            console.log( '>> timeout ends' );
            this.productList.getProductInfo();
            this.finishLoading();
        }, 3000 );
    }

    cancel() {
        console.log( '>> productUpdate.cancel' );
    }

    onProductNumberUpdated() {
        console.log( '>> productUpdate.onProductNumberUpdated: ' + this.productNumberInitials );
        var found = this.productList.getProductProgressivelyByNumber( this.productNumberInitials );
        this.searchResult = found;
        //console.log('>> found: ' + found.length);
        //console.log('>> json: ' + JSON.stringify(found));
        //this.clear();
        if ( this.searchResult.length == 1 ) {
            console.log( '>> found item: ' + found[0].productName );
            this.showProduct( found[0] );
        }
    }

    onProductNameUpdated() {
        console.log( '>> productUpdate.onProductNameUpdated: ' + this.productNameInitials );
        var found = this.productList.getProductByWord( this.productNameInitials );
        this.searchResult = found;
        console.log( '>> found: ' + found.length );
    }

    onProductCodeUpdated() {
        console.log( '>> productUpdate.onProductCodeUpdated: ' + this.productCode );
    }

    onProductSelected( productName, index ) {
        console.log( '>> productUpdate.onProductSelected: ' + productName + ' index: ' + index + ' obj: ' + this.searchResult[index].objectId );
        this.clear();
        //this.productName = productName;
        this.objectId = this.searchResult[index].objectId;
        this.productNumber = this.searchResult[index].ISBN;
        this.productName = this.searchResult[index].productName;
        this.productCode = this.searchResult[index].productCode;
        this.productNameInitials = this.searchResult[index].productName;
        this.price = this.searchResult[index].price;
        this.amountInStock = this.searchResult[index].amountInStock;
        this.inProduction = this.searchResult[index].availableFromPublisher;
        //document.getElementById("product_number_list").style.visibility = "hidden";
        //document.getElementById("product_name_list").style.visibility = "hidden";
        this.searchResult.splice( 0, this.searchResult.length )
    }

    showProduct( productInfo ) {
        console.log( '>> productUpdate.showProduct: ' + productInfo.objectId );
        this.objectId = productInfo.objectId;
        this.productNumber = productInfo.ISBN;
        this.productName = productInfo.productName;
        this.price = productInfo.price;
        this.amountInStock = productInfo.amountInStock;
        this.inProduction = productInfo.availableFromPublisher;
        console.log( '>> ' + JSON.stringify( productInfo ) );
    }

    /*
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
      */

    increaseAmount() {
        console.log( '>> productUpdate.increaseAmount, current amountInStock ' + this.amountInStock );
        var tmpStr = this.amountInStock.toString();
        if ( tmpStr.length > 0 ) {
            var amountInStock = parseInt( tmpStr, 10 );
            amountInStock++;
            this.amountInStock = amountInStock.toString();
        }
    }

    reduceAmount() {
        console.log( '>> productUpdate.reduceAmount, current amountInStock ' + this.amountInStock );
        var tmpStr = this.amountInStock.toString();
        if ( tmpStr.length > 0 ) {
            var amountInStock = parseInt( tmpStr, 10 );
            if ( amountInStock > 0 ) {
                amountInStock--;
                this.amountInStock = amountInStock.toString();
            }
        }
    }

    clear() {
        console.log( '>> productUpdate.clear' );
        this.productNumber = "";
        this.productName = "";
        this.price = "";
        this.amountInStock = "";
        this.inProduction = false;
        this.objectId = "";
    }

    presentLoading() {
        this.loadingIndicator = this.loadingCtrl.create( {
            content: "Haetaan tuotteet..."
            //duration: 3000;
        } );
        this.loadingIndicator.present();
    }

    finishLoading() {
        this.loadingIndicator.dismiss();
    }
}
