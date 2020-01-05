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

	constructor(public http: HttpClient) {
		console.log('Hello RestProvider Provider');
	}

	productInfo(data) {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'X-Parse-Application-Id': '365_ghg_867_fhj'
			})
		};
		return new Promise((resolve, reject) => {
			this.http.post(this.herokuUrl + '/productinfo', '{}', httpOptions)
				.subscribe(res => {
				resolve(res);
			}, (err) => {
				reject(err);
			});
		});
	}

	addProduct(data) {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'X-Parse-Application-Id': '365_ghg_867_fhj'
			})
		};
		return new Promise((resolve, reject) => {
			this.http.post(this.herokuUrl + '/addproduct', JSON.stringify(data), httpOptions)
				.subscribe(res => {
				resolve(res);
			}, (err) => {
				reject(err);
			});
		});
	}

	saveProduct(data) {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'X-Parse-Application-Id': '365_ghg_867_fhj'
			})
		};
		return new Promise((resolve, reject) => {
			this.http.post(this.herokuUrl + '/saveproduct', JSON.stringify(data), httpOptions)
				.subscribe(res => {
				resolve(res);
			}, (err) => {
				reject(err);
			});
		});
	}

	removeProduct(data) {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'X-Parse-Application-Id': '365_ghg_867_fhj'
			})
		};
		return new Promise((resolve, reject) => {
			this.http.post(this.herokuUrl + '/removeproduct', JSON.stringify(data), httpOptions)
				.subscribe(res => {
				resolve(res);
			}, (err) => {
				reject(err);
			});
		});
	}

	connectToPT() {
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type':  'application/json',
				'X-Parse-Application-Id': '365_ghg_867_fhj'
			})
		};
		return new Promise((resolve, reject) => {
			this.http.post(this.herokuUrl + '/connect_to_pt', '[]', httpOptions)
				.subscribe(res => {
				resolve(res);
			}, (err) => {
				reject(err);
			});
		});
	}
}
