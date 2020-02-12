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

    emptyProduct = JSON.parse( '{"ISBN":"","Tuotenro":"","Tuote":"Tuotetta ei varastossa","Kpl":"0","Hinta":"", "Tilattavissa":"True"}' );
    nullProduct = JSON.parse( '[]' );

    productInfoStr: any;
    productInfo: any;
    //productInfo = {ISBN:'', productCode:'', productName:'', amountInStock:'', price:'', availableFromPublisher:'', createdAt:'', updatedAt:'', objectId:''};

    constructor( public httpClient: HttpClient, public restProvider: RestProvider ) {
        console.log( 'Hello ProductList Provider' );
        //this.getProductInfo();
    }

    products() {
        return this.productInfo;
    }

    getProductInfo() {
        console.log( '>> productList.getProductInfo' );
        this.restProvider.productInfo( "" ).then(( result: any ) => {
            console.log( '>> result received' );
            this.productInfoStr = result.result;
            this.productInfo = JSON.parse( this.productInfoStr );
        }, ( err ) => {
            console.log( err );
        } );
    }

    getProductByNumber( isbnNumber ) {
        console.log( '>> productList.getProductByNumber' );
        for ( var i = 0; i < this.productInfo.length; i++ ) {
            if ( isbnNumber == this.productInfo[i].ISBN.replace( /-/g, '' ) ) {
                console.log( '>> found' );
                return this.productInfo[i];
            }
        }
        return this.emptyProduct;
    }


    getProductProgressivelyByNumber( letters ) {
        console.log( '>> productList.getProductProgressivelyByNumber' );
        if ( letters.length == 0 ) {
            return this.nullProduct;
        }
        console.log( '>> ProductList.getProductByNumber' );
        var results = [];
        //console.log('>> LEN ' + this.productInfo.length);
        for ( var i = 0; i < this.productInfo.length; i++ ) {
            if ( this.productInfo[i].ISBN.replace( /-/g, '' ).startsWith( letters ) ) {
                //console.log('>> candicate found');
                //console.log('>> ISBN: ' + this.productInfo[i].ISBN);
                //console.log('>> product code: ' + this.productInfo[i].ISBN.replace(/-/g,''));
                results.push( this.productInfo[i] );
            }
        }
        return results;
    }

    getProductByName( letters ) {
        console.log( '>> productList.getProductByName' );
        if ( letters.length == 0 ) {
            return this.nullProduct;
        }
        var results = [];
        for ( var i = 0; i < this.productInfo.length; i++ ) {
            if ( this.productInfo[i].productName.toLowerCase().startsWith( letters.toLowerCase() ) ) {
                results.push( this.productInfo[i] );
            }
        }
        return results;
    }

    getProductByWord( letters ) {
        console.log( '>> productList.getProductByName' );
        if ( letters.length == 0 ) {
            return this.nullProduct;
        }
        var results = [];
        for ( var i = 0; i < this.productInfo.length; i++ ) {
            //if (this.productInfo[i].productName.toLowerCase().startsWith(letters.toLowerCase())) {
            var n = this.productInfo[i].productName.toLowerCase().indexOf( letters.toLowerCase() );
            if ( n >= 0 ) {
                results.push( this.productInfo[i] );
            }
        }
        return results;
    }

    getProductsNotKeptInStock() {
        console.log( '>> productList.getProductsNotKeptInStock' );

        var results = [];
        for ( var i = 0; i < this.productInfo.length; i++ ) {
            if ( this.productInfo[i].stockKeepingCount < 1 ) {
                results.push( this.productInfo[i] );
            }
        }
        return results;
    }

    getProductsBelowCount( count ) {
        console.log( '>> productList.getProductsBelowCount' );
        var results = [];
        for ( var i = 0; i < this.productInfo.length; i++ ) {
            if ( this.productInfo[i].amountInStock < this.productInfo[i].stockKeepingCount &&
                this.productInfo[i].availableFromPublisher ) {
                results.push( this.productInfo[i] );
            }
        }
        return results;
    }

    getProductCount() {
        //return this.productList.length;
    }

    updateProductInfo( updatedInfo ) {
        console.log( '>> ProductList.updateProductInfo' );
        this.restProvider.saveProduct( updatedInfo ).then(( result: any ) => {
            console.log( ">> product info saved" );
        }, ( err ) => {
            console.log( err );
        } );
    }

    addProduct( updatedInfo ) {
        console.log( '>> ProductList.addProduct' );
        this.restProvider.addProduct( updatedInfo ).then(( result: any ) => {
            console.log( ">> product added" );
        }, ( err ) => {
            console.log( err );
        } );
    }

    removeProduct( updatedInfo ) {
        console.log( '>> ProductList.removeProduct' );
        this.restProvider.removeProduct( updatedInfo ).then(( result: any ) => {
            console.log( ">> product removed" );
        }, ( err ) => {
            console.log( err );
        } );
    }
}
