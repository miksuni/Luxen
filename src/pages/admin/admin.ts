import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ReportProvider } from '../../providers/report/report';
import { ProductList } from '../../providers/productlist/productlist';

@IonicPage()
@Component( {
    selector: 'page-admin',
    templateUrl: 'admin.html',
} )
export class AdminPage {

    productsToBeOrdered: any;
    products: any;

    constructor( public navCtrl: NavController,
        public navParams: NavParams,
        private reportProvider: ReportProvider,
        private productList: ProductList ) {
    }

    ionViewDidLoad() {
        console.log( 'ionViewDidLoad AdminPage' );
        //this.getProductsToBeOrdered();
    }

    getProductsToBeOrdered() {
        this.productsToBeOrdered = this.productList.getProductsBelowCount( 2 );
    }

    getProductList() {
        this.reportProvider.sendProductInfoDbDumb();
    }

    getSoldProducts() {
        this.reportProvider.senddBClassDumb( "SoldItem" );
    }

    getReceipts() {
        this.reportProvider.senddBClassDumb( "Receipt" );
    }
}
