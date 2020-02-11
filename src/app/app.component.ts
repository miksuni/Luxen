import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//import { HomePage } from '../pages/home/home';
import { ShopPage } from '../pages/shop/shop';
import { AdminPage } from '../pages/admin/admin';
import { ProductUpdatePage } from '../pages/productUpdate/productUpdate';

@Component( {
    templateUrl: 'app.html'
} )
export class MyApp {
    @ViewChild( Nav ) nav: Nav;

    rootPage: any = ShopPage;

    pages: Array<{ icon: string, title: string, component: any }>;

    constructor( public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen ) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [
            { icon: 'logo-euro', title: 'Julkaisumyynti', component: ShopPage },
            { icon: 'construct', title: 'Tuotteiden päivitys', component: ProductUpdatePage },
            { icon: 'stats', title: 'Hallinta', component: AdminPage }
        ];

    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        } );
    }

    openPage( page ) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot( page.component );
    }
}
