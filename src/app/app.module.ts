import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
//import { HomePage } from '../pages/home/home';
import { AdminPage } from '../pages/admin/admin';
import { ShopPage } from '../pages/shop/shop';
import { ProductUpdatePage } from '../pages/productUpdate/productUpdate';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { HttpClientModule } from '@angular/common/http';
import { ProductList } from '../providers/productlist/productlist';
import { RestProvider } from '../providers/rest/rest';
import { ShoppingcartProvider } from '../providers/shoppingcart/shoppingcart';
import { ReportProvider } from '../providers/report/report';
import { InlineWorker } from '../pages/shop/inlineworker';

@NgModule( {
    declarations: [
        MyApp,
        /*HomePage,*/
        AdminPage,
        ShopPage,
        ProductUpdatePage
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        IonicModule.forRoot( MyApp, {
            scrollAssist: false
        } ),
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        /*HomePage,*/
        AdminPage,
        ShopPage,
        ProductUpdatePage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        BarcodeScanner,
        ProductList,
        RestProvider,
        { provide: ErrorHandler, useClass: IonicErrorHandler },
        ShoppingcartProvider,
        ReportProvider
    ]
} )
export class AppModule { }
