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
        console.log( 'Hello ShoppingcartProvider Provider' );
    }

    setCashier( cashier ) {
        console.log( '>> ShoppingcartProvider.setCashier: ' + cashier );
        this.cashier = cashier;
        this.receipt.cashier = cashier;
    }

    setPaymentMethods( paymentMethods ) {
        console.log( 'setPaymentMethod' );
        this.paymentMethod1 = paymentMethods[0];
        this.paymentMethod2 = paymentMethods[1];
        this.receipt.paymentMethod1 = this.paymentMethod1;
        this.receipt.paymentMethod2 = this.paymentMethod2;
    }

    addProduct( productInfo ) {
        console.log( '>> ShoppingcartProvider.addProduct' );
        productInfo.quantity = 1;
        productInfo.total = productInfo.price;
        productInfo.totalAsString = productInfo.total.toFixed( 2 );
        productInfo.priceAsString = productInfo.price.toFixed( 2 );
        this.shoppingCart.push( productInfo );
        this.productsInCart++;
        this.totalSum += productInfo.price;
        this.receipt.totalSum = this.totalSum;
        console.log( '>> cart content: ' + JSON.stringify( this.shoppingCart ) );
    }

    removeProduct( i ) {
        console.log( '>> ShoppingcartProvider.removeProduct' );
        if ( i >= 0 && i < this.shoppingCart.length ) {
            this.productsInCart -= this.shoppingCart[i].quantity;
            this.totalSum -= ( this.shoppingCart[i].price * this.shoppingCart[i].quantity );
            this.shoppingCart.splice( i, 1 );
        }
        this.receipt.totalSum = this.totalSum;
        return this.shoppingCart;
    }

    clearAll() {
        console.log( '>> ShoppingcartProvider.clearAll' );
        this.shoppingCart.splice( 0, this.shoppingCart.length );
        this.productsInCart = 0;
        this.totalSum = 0;
    }

    hasContent() {
        return this.shoppingCart.length > 0;
    }

    increase( i ) {
        console.log( '>> ShoppingcartProvider.increase' );
        this.shoppingCart[i].quantity++;
        this.shoppingCart[i].total += this.shoppingCart[i].price;
        this.shoppingCart[i].totalAsString = this.shoppingCart[i].total.toFixed( 2 );
        this.productsInCart++;
        this.totalSum += this.shoppingCart[i].price;
        this.receipt.totalSum = this.totalSum;
        console.log( '>> total 1: ' + this.shoppingCart[i].total );
        console.log( '>> total 2: ' + this.totalSum );
    }

    decrease( i ) {
        console.log( 'ShoppingcartProvider.decrease' );
        this.productsInCart--;
        this.totalSum -= this.shoppingCart[i].price;
        this.receipt.totalSum = this.totalSum;
        if ( this.shoppingCart[i].quantity > 1 ) {
            this.shoppingCart[i].quantity--;
            this.shoppingCart[i].total -= this.shoppingCart[i].price;
            this.shoppingCart[i].totalAsString = this.shoppingCart[i].total.toFixed( 2 );
        } else {
            this.shoppingCart.splice( i, 1 );
        }
    }

    getProducts() {
        console.log( '>> ShoppingcartProvider.getProducts' );
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

    // TODO: Remove if not needed
    saveReceipt() {
        console.log( '>> ShoppingcartProvider.saveReceipt' );
        console.log( 'shoppingCart: ' + JSON.stringify( this.shoppingCart ) );
        console.log( 'receipt: ' + JSON.stringify( this.receipt ) );
        this.receipt.receiptNr = 1;
        this.purchase.productList = this.shoppingCart;
        this.purchase.total = this.receipt;
        this.restProvider.sendRequest( "saveReceipt", this.purchase );
    }

    // TODO: rename
    saveReceipt2( receiptData ) {
        console.log( '>> ShoppingcartProvider.saveReceipt2' );
        console.log( 'shoppingCart2: ' + JSON.stringify( this.shoppingCart ) );
        console.log( 'receiptData: ' + JSON.stringify( receiptData ) );
        this.purchaseData.productList = this.shoppingCart;
        this.purchaseData.receiptData = receiptData;
        console.log( 'purchaseData: ' + JSON.stringify( this.purchaseData ) );
        this.restProvider.sendRequest( "save_purchase_data", this.purchaseData );
    }

    // JSON data must be encoded in ASCII which also means character and byte
    // length will match.
    jsonStringifyAscii( val ) {
        return JSON.stringify( val ).replace( /[\u007f-\uffff]/g, function( x ) {
            return '\\u' + ( '0000' + x.charCodeAt( 0 ).toString( 16 ) ).substr( -4 );
        } );
    }

    connectToPT() {
        console.log( '>> ShoppingcartProvider.purhase' );


        var id_counter = 0;
        var obj = {
            jsonrpc: '2.0',
            method: 'ExampleMethod',
            params: { argument: 'value', nonascii: 'foo\u1234bar' },
            id: 'req-' + ( ++id_counter )
        };

        var jsonData = this.jsonStringifyAscii( obj );
        var frame = ( '00000000' + jsonData.length.toString( 16 ) ).substr( -8 ) +
            ':' + jsonData + '\n';// Write 'frame' (which is pure ASCII) to the socket.

        console.log( frame );

        this.restProvider.connectToPT().then(( result: any ) => {
            console.log( ">> product(s) purchased" );
        }, ( err ) => {
            console.log( err );
        } );
    }
}
