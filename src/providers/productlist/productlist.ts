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

    isTester: boolean = false;

    productInfo: any = [];
    //productInfo = {ISBN:'', productCode:'', productName:'', amountInStock:'', price:'', availableFromPublisher:'', createdAt:'', updatedAt:'', objectId:''};

    constructor( public httpClient: HttpClient, public restProvider: RestProvider ) {
        //this.getProductInfo();
    }

    products() {
        return this.productInfo;
    }

    setTestUser( isTestUser ) {
        this.isTester = isTestUser;
    }

    getProductInfo() {
        this.restProvider.productInfo( "" ).then(( result: any ) => {
            this.productInfo = JSON.parse( result.result );
        }, ( err ) => {
            console.log( err );
        } );
    }

    getTestProductInfo() {
        this.restProvider.productInfo( "" ).then(( result: any ) => {
            var allProducts = JSON.parse( result.result );
            this.productInfo = [];
            for ( var i = 0; i < allProducts.length; i++ ) {
                var n = allProducts[i].productName.toLowerCase().indexOf( "testituote" );
                if ( n >= 0 ) {
                    this.productInfo.push( allProducts[i] );
                }
            }
        }, ( err ) => {
            console.log( err );
        } );
    }

    getProductByNumber( isbnNumber ) {
        for ( var i = 0; i < this.productInfo.length; i++ ) {
            if ( isbnNumber == this.productInfo[i].ISBN.replace( /-/g, '' ) ) {
                return this.productInfo[i];
            }
        }
        return this.emptyProduct;
    }

    getProductProgressivelyByNumber( letters ) {
        if ( letters.length == 0 ) {
            return this.nullProduct;
        }
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

        var results = [];
        for ( var i = 0; i < this.productInfo.length; i++ ) {
            if ( this.productInfo[i].stockKeepingCount < 1 ) {
                results.push( this.productInfo[i] );
            }
        }
        return results;
    }

    getProductsBelowCount( count ) {
        var results = [];
        for ( var i = 0; i < this.productInfo.length; i++ ) {
            if ( this.productInfo[i].amountInStock < this.productInfo[i].stockKeepingCount &&
                this.productInfo[i].availableFromPublisher ) {
                results.push( this.productInfo[i] );
            }
        }
        return results;
    }

    updateProductInfo( updatedInfo ) {
        this.restProvider.saveProduct( updatedInfo ).then(( result: any ) => {
        }, ( err ) => {
            console.log( err );
        } );
    }

    addProduct( updatedInfo ) {
        this.restProvider.addProduct( updatedInfo ).then(( result: any ) => {
        }, ( err ) => {
            console.log( err );
        } );
    }

    removeProduct( updatedInfo ) {
        this.restProvider.removeProduct( updatedInfo ).then(( result: any ) => {
        }, ( err ) => {
            console.log( err );
        } );
    }
}
