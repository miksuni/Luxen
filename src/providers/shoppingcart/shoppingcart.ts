import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RestProvider } from '../../providers/rest/rest';

/*
  Generated class for the ShoppingcartProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ShoppingcartProvider {

    // TODO: remove receipt when not needed
    receipt = {
        receiptNr: 0,
        cashier: '',
        totalSum: 0,
        paymentMethod1: '',
        paymentMethod2: ''
    };

    /*shoppingcart = [{ objectId:'',
                     ISBN:'',
                     productName:'',
                     price:'',
                     amountInStock:'',
                     productCode:'',
                     availableFromPublisher:'',
                     quantity: 0,
                     total: 0 }];*/
    shoppingCart = [];
    purchase = { productList: [], total: {} }; // remove
    purchaseData = { productList: [], receiptData: {} };
    productsInCart = 0;
    totalSum = 0;
    cashier = "";
    paymentMethod1: "";
    paymentMethod2: "";

    constructor( public http: HttpClient, public restProvider: RestProvider ) {
    }

    setCashier( cashier ) {
        this.cashier = cashier;
        this.receipt.cashier = cashier;
    }

    addProduct( productInfo ) {
        productInfo.quantity = 1;
        productInfo.total = productInfo.price;
        productInfo.totalAsString = productInfo.total.toFixed( 2 );
        productInfo.priceAsString = productInfo.price.toFixed( 2 );
        this.shoppingCart.push( productInfo );
        this.productsInCart++;
        this.totalSum += productInfo.price;
        this.receipt.totalSum = this.totalSum;
    }

    removeProduct( i ) {
        if ( i >= 0 && i < this.shoppingCart.length ) {
            this.productsInCart -= this.shoppingCart[i].quantity;
            this.totalSum -= ( this.shoppingCart[i].price * this.shoppingCart[i].quantity );
            this.shoppingCart.splice( i, 1 );
        }
        this.receipt.totalSum = this.totalSum;
        return this.shoppingCart;
    }

    clearAll() {
        this.shoppingCart.splice( 0, this.shoppingCart.length );
        this.productsInCart = 0;
        this.totalSum = 0;
    }

    hasContent() {
        return this.shoppingCart.length > 0;
    }

    increase( i ) {
        this.shoppingCart[i].quantity++;
        this.shoppingCart[i].total += this.shoppingCart[i].price;
        this.shoppingCart[i].totalAsString = this.shoppingCart[i].total.toFixed( 2 );
        this.productsInCart++;
        this.totalSum += this.shoppingCart[i].price;
        this.receipt.totalSum = this.totalSum;
    }

    decrease( i ) {
        this.productsInCart--;
        this.totalSum -= this.shoppingCart[i].price;
        this.receipt.totalSum = this.totalSum;
        //if ( this.shoppingCart[i].quantity > 1 ) {
        this.shoppingCart[i].quantity--;
        this.shoppingCart[i].total -= this.shoppingCart[i].price;
        this.shoppingCart[i].totalAsString = this.shoppingCart[i].total.toFixed( 2 );
        //} else {
        //    this.shoppingCart.splice( i, 1 );
        //}
    }

    getProducts() {
        return this.shoppingCart;
    }

    hasProduct( productName ) {
        for ( var i = 0; i < this.shoppingCart.length; i++ ) {
            if ( productName === this.shoppingCart[i].productName ) {
                return true;
            }
        }
        return false;
    }

    saveReceipt( receiptData ) {
        this.purchaseData.productList = this.shoppingCart;
        this.purchaseData.receiptData = receiptData;
        //this.restProvider.sendRequest( "save_purchase_data", this.purchaseData );

        this.restProvider.sendRequest( "save_purchase_data", this.purchaseData ).then(( result: any ) => {
            var response = JSON.parse( result.result );
            console.log( "saveReceipt result: " + JSON.stringify( response ) );
        }, ( err ) => {
            console.log( 'error in authorization: ' + err );
        } ).catch(( result: any ) => {
            console.log( 'authorization failed' );
        } )

    }

    getPurchaseData() {
        return this.purchaseData;
    }

    // JSON data must be encoded in ASCII which also means character and byte
    // length will match.
    jsonStringifyAscii( val ) {
        return JSON.stringify( val ).replace( /[\u007f-\uffff]/g, function( x ) {
            return '\\u' + ( '0000' + x.charCodeAt( 0 ).toString( 16 ) ).substr( -4 );
        } );
    }
}
