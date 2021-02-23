import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the RestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestProvider {

    apiUrl = 'https://jsonplaceholder.typicode.com';
    herokuUrl = 'https://luxen.herokuapp.com/parse/functions'; // '/hello';
    appId = "";

    constructor( public http: HttpClient ) {
        console.log( 'Hello RestProvider Provider' );
        this.getEnv();
    }

    sendRequest( request, data ) {
        const httpOptions = {
            headers: new HttpHeaders( {
                'Content-Type': 'application/json',
                'X-Parse-Application-Id': this.appId
            } )
        };
        return new Promise(( resolve, reject ) => {
            this.http.post( this.herokuUrl + '/' + request, JSON.stringify( data ), httpOptions )
                .subscribe( res => {
                    resolve( res );
                    console.log( "sendRequest result: " + JSON.stringify( res ) );
                }, ( err ) => {
                    reject( err );
                } );
        } );
    }

    cashiers( data ) {
        return this.sendRequest( 'cashiers', data );
    }

    productInfo( data ) {
        return this.sendRequest( 'productinfo', JSON.parse( '{}' ) );
    }

    addProduct( data ) {
        return this.sendRequest( 'addproduct', data );
    }

    saveProduct( data ) {
        return this.sendRequest( 'saveproduct', data );
    }

    removeProduct( data ) {
        return this.sendRequest( 'removeproduct', data );
    }

    connectToPT() {
        return this.sendRequest( 'connect_to_pt', '[]' );
    }

    disconnectPT() {
        return this.sendRequest( 'close_pt_connection', JSON.parse( '[]' ) );
    }


    getEnv() {
        this.http
            .get( '../../assets/data/env.json', {
                responseType: 'text'
            } )
            .subscribe(
            data => { this.appId = JSON.parse( data ).APP_ID; console.log( this.appId ) },
            err => console.log( 'something went wrong: ', err )
            );
    }
}
