import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ReportProvider } from '../../providers/report/report';
import { ProductList } from '../../providers/productlist/productlist';
import { AlertController } from 'ionic-angular';

@IonicPage()
@Component( {
    selector: 'page-admin',
    templateUrl: 'admin.html',
} )
export class AdminPage {

    searchResults: any;
    products: any;
    testMode: boolean;

    constructor( public navCtrl: NavController,
        public navParams: NavParams,
        private reportProvider: ReportProvider,
        private productList: ProductList,
        private alertController: AlertController ) {
    }

    ionViewDidLoad() {
        console.log( 'ionViewDidLoad AdminPage' );
        document.getElementById( "productTable" ).style.visibility = "hidden";
        this.testMode = this.reportProvider.getTestMode();
    }

    onTestModeChanged() {
        console.log( 'onTestModeChanged: ' + this.testMode );
        this.reportProvider.setTestMode( this.testMode );
    }

    getProductsToBeOrdered() {
        document.getElementById( "productTable" ).style.visibility = "visible";
        this.searchResults = this.productList.getProductsBelowCount( 2 );
    }

    getProductsNotKeptInStock() {
        this.searchResults = this.productList.getProductsNotKeptInStock();
    }

    doProductListBu() {
        this.reportProvider.sendProductInfoDbDumb();
    }

    doSoldProductsBu() {
        this.reportProvider.senddBClassDumb( "SoldItem" );
    }

    doReceiptsBu() {
        this.reportProvider.senddBClassDumb( "Receipt" );
    }

    initProductListBu() {
        let alert = this.alertController.create( {
            title: 'Varmuuskopioidaanko tuotetietokanta?',
            buttons: [
                {
                    text: 'Kyllä',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                        this.doProductListBu();
                    }
                },
                {
                    text: 'Ei',
                    handler: () => {
                        console.log( 'Cancel' );
                    }
                }
            ]
        } );
        alert.present();
    }

    initSoldProductsBu() {
        let alert = this.alertController.create( {
            title: 'Varmuuskopioidaanko myytyjen tuotteiden lista?',
            buttons: [
                {
                    text: 'Kyllä',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                        this.doSoldProductsBu();
                    }
                },
                {
                    text: 'Ei',
                    handler: () => {
                        console.log( 'Cancel' );
                    }
                }
            ]
        } );
        alert.present();
    }

    initReceiptsBu() {
        let alert = this.alertController.create( {
            title: 'Varmuuskopioidaanko kuitit?',
            buttons: [
                {
                    text: 'Kyllä',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                        this.doReceiptsBu();
                    }
                },
                {
                    text: 'Ei',
                    handler: () => {
                        console.log( 'Cancel' );
                    }
                }
            ]
        } );
        alert.present();
    }
}
