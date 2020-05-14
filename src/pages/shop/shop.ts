import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProductList } from '../../providers/productlist/productlist';
import { ShoppingcartProvider } from '../../providers/shoppingcart/shoppingcart';
import { ReportProvider } from '../../providers/report/report';
import { RestProvider } from '../../providers/rest/rest';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import * as $ from "jquery";

/**
 * Generated class for the ShopPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component( {
    selector: 'page-shop',
    templateUrl: 'shop.html',
} )
export class ShopPage {

    productNumberInitials: string = "";
    productNameInitials: string = "";

    cartContent = [];
    //receiptContent = [];
    //receiptPaymentMethods = [];
    //purchaseData = { productList: [], receiptData: {} };
    purchasedItems = [];
    receiptPaymentMethods = [];
    
    searchResult: any;

    sites = [{ id: 'Lahti' }];
    cashiers: any;
    currentState: any;
    orderList = { products: [] };
    chat = { from: '', message: '' };
    chatMessages: any;
    chatMessage: string = "";
    //productInfo = { objectId:'', ISBN:'', productName:'', price:'', amountInStock:'', productCode:'', availableFromPublisher:'' };
    productsInCart = 0;
    totalSum: number = 0;
    totalSumAsString: string = "";
    receiptTotalSumAsString: string = "";

    shoppingCartReturnBasket = "";
    productReturnValue = 0;
    productsInReturnBasket = 0;

	transactionStatus = 0;
    cardPaymentStatus = 0;

    ptConnected = false;
	ptStatusIcon = "alert";
	ptStatusIconColor = "dark";
	ptStatusMessage = "";
	ptConnectionInitiated = false;
	ptConnectionTerminated = false;
    
    paymentPollTimer;
    cardPurchaseGoingOn = false;
    
    soldItems: any;

    version = "Kassaversio 1.1.0";

    /*
    paymentInfo = {
        giftCard1: {
            value: 0,
            cardtype: 0,
            receiver: '',
            givenDate: '2020-01-01T00:00:00.000Z'
        },
        giftCard2: {
            value: 0,
            cardtype: 1,
            receiver: '',
            originator: '',
            givenDate: '2020-01-01T00:00:00.000Z',
            valueBefore: 0,
            valueAfter: 0
        },
        cash: 0,
        card: 0
    };
    */

    // TODO: KUN COMBINED PAYMENT TALLETETTU, NOLLAA NÄMÄ !!!
    toBePaid: number = 0;
    testModel: number = 0.0;
    giftCard1Type: number = 0;
    giftCard1Receiver: string = "";
    giftCard1PurchaseDate: any = "";
    giftCard2Payment: number = 0.0;
    giftCard2Receiver: string = "";
    giftCard2PurchaseDate: any = "";
    giftCard2Originator: string = "";
    giftCard2AmountBefore: number = 0.0;
    giftCard2AmountAfter: number = 0.0;
    payments = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];

    givenAmount = 0;
    cashBack = 0;

    moneyGiven: number = 0.0;

    cardPaymentEnabled: boolean = false;
    cashPaymentEnabled: boolean = false;
    combinedPaymentEnabled: boolean = false;
    confirmedPaymentEnabled: boolean = false;

    cashier = "";

    loadingIndicator: any;

    constructor( public navCtrl: NavController,
        public navParams: NavParams,
        public productList: ProductList,
        private shoppingCart: ShoppingcartProvider,
        private reportProvider: ReportProvider,
        public restProvider: RestProvider,
        private alertController: AlertController,
        public loadingCtrl: LoadingController ) {
	    console.log('shop page constructor');
    }

    //    ngAfterViewInit() {
    //        $( document ).ready( function() {
    //            //alert( 'JQuery is working!!' );
    //            $( ".btn1" ).click( function() {
    //                $( "#shopping_cart_area" ).show();
    //                $( "#payment_data_area" ).hide();
    //            } );
    //            $( ".btn2" ).click( function() {
    //                $( "#shopping_cart_area" ).hide();
    //                $( "#payment_data_area" ).show();
    //            } );
    //        } );
    //    }

    ionViewDidLoad() {
        console.log( 'ionViewDidLoad ShopPage' );
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#soldItems" ).hide();
        this.presentLoading( "Käynnistetään kassa ja haetaan tuotetiedot..." );
        ( <HTMLInputElement>document.getElementById( "cm11" ) ).value = "0";
        ( <HTMLInputElement>document.getElementById( "cm21" ) ).disabled = true;
        ( <HTMLInputElement>document.getElementById( "cm21" ) ).value = "0";
        ( <HTMLInputElement>document.getElementById( "cm31" ) ).disabled = true;
        ( <HTMLInputElement>document.getElementById( "cm31" ) ).value = "0";
        ( <HTMLInputElement>document.getElementById( "cm41" ) ).disabled = true;
        ( <HTMLInputElement>document.getElementById( "cm41" ) ).value = "0";
        ( <HTMLInputElement>document.getElementById( "cm51" ) ).disabled = true;
        ( <HTMLInputElement>document.getElementById( "cm51" ) ).value = "0";
        ( <HTMLInputElement>document.getElementById( "logout_button" ) ).disabled = true;
        ( <HTMLInputElement>document.getElementById( "product_return_button" ) ).disabled = true;
        this.productList.getProductInfo();
        this.shoppingCart.clearAll();
        this.cartContent = this.shoppingCart.getProducts();
        this.getCurrentState();
        this.getCashiers();
		//this.getPTStatus();
        //this.getChat();
        this.update();
    }

    testModelChanged( $event ) {
        console.log( '>> testModelChanged: ' + $event )
    }

    getCashiers() {
        console.log( '>> home.getCashiers' );
        this.restProvider.cashiers( "" ).then(( result: any ) => {
            console.log( '>> result received' );
            this.cashiers = JSON.parse( result.result );
            console.log( 'cashiers: ' + JSON.stringify( this.cashiers ) );
            this.finishLoading();
        }, ( err ) => {
            console.log( err );
        } );
    }

    getCurrentState() {
        console.log( '>> home.getCurrentState' );
        this.restProvider.sendRequest( 'current_state', [] ).then(( result: any ) => {
            console.log( '>> result received' );
            var currentState = JSON.parse( result.result );
            if ( currentState.length > 0 ) {
                this.currentState = currentState[0];
            }
            console.log( 'currentState: ' + JSON.stringify( this.currentState ) );

        }, ( err ) => {
            console.log( 'error in getting current state: ' + err );
        } )
		.catch((result:any) => {
			console.log('getting current state failed');
		} )
    }

    // Works only wiht ion-select
    //onCashierChange($event){
    //    console.log('>> onCashierChange: ' + $event);
    //    this.cashier = $event;
    //    this.shoppingCart.setCashier(this.cashier);
    //}

    onCashierSelected( $event ) {
        console.log( 'onCashierSelected' );
        $( "#shopping_cart_area" ).show();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#soldItems" ).hide();
        var e = document.getElementById( "current_cashier" ) as HTMLSelectElement;
        console.log( "selected index: " + e.selectedIndex );
        if ( e.selectedIndex > 0 ) {
            //e.disabled = false; // does now work
            ( <HTMLInputElement>document.getElementById( "logout_button" ) ).disabled = false;
            //this.connectPt();
            this.startPtConnectionPoll();
        }
    }

    onLogout() {
        console.log( '>> shop.onLogout' );
        $( "#shopping_cart_area" ).show();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#soldItems" ).hide();
        this.ptStatusMessage = "";
        if ( this.shoppingCart.hasContent() ) {
            this.presentPromptItemsInShoppingCart();
        } else {
            var e = document.getElementById( "current_cashier" ) as HTMLSelectElement;
            e.selectedIndex = 0;
            ( <HTMLInputElement>document.getElementById( "logout_button" ) ).disabled = true;
        }
        this.disconnectPt();
        this.presentPromptSendReport();
        //this.reportProvider.sendToBeOrderedReport();
        // TODO: ACTIVATE IN PRODUCTION
        /*this.orderList.products = this.productList.getProductsBelowCount(2);
        if (this.orderList.products.length > 0) {
            console.log('>> number of items to be ordered: ' + this.orderList.products.length);
            this.restProvider.sendRequest('send_email', this.orderList);
        }*/
    }

    onInputClicked() {
        console.log( '>> shop.onInputClicked:' );
        var e = document.getElementById( "current_cashier" ) as HTMLSelectElement;
        //var value = e.options[e.selectedIndex].value;
        this.cashier = e.options[e.selectedIndex].text;
        console.log( "cashier: " + e.options[e.selectedIndex].text );
        if ( this.cashier.length == 0 ) {
            this.presentPromptSelectCashier();
        }
    }

    onProductNumberUpdated() {
        //        console.log( '>> shop.onProductNumberUpdated: ' + this.productNumberInitials );
        //        //document.getElementById( "receipt_view" ).style.visibility = "hidden";
        //        if ( this.productNumberInitials.length > 0 ) {
        //            var found = this.productList.getProductProgressivelyByNumber( this.productNumberInitials );
        //            this.searchResult = found;
        //            console.log( '>> found: ' + found.length );
        //            //console.log( '>> json: ' + JSON.stringify( found ) );
        //        }
    }

    onProductNameUpdated() {
        console.log( '>> shop.onProductNameUpdated: ' + this.productNameInitials );
        var found = this.productList.getProductByWord( this.productNameInitials );
        this.searchResult = found;
        console.log( '>> found: ' + found.length );
    }

    onProductSelected( productName, index ) {
        console.log( '>> shop.onProductSelected: ' + productName + ' index: ' + index );
        this.checkConditions( this.searchResult[index] );
        // clear search result list
        this.searchResult.splice( 0, this.searchResult.length );
        this.productNameInitials = "";
    }

    addToShoppingCart( productInfo ) {
        console.log( '>> shop.addToShoppingCart' );
        if ( productInfo.amountInStock < 1 ) {
            this.presentPromptNoItemsInStock( productInfo );
        } else {
            this.shoppingCart.addProduct( productInfo );
            this.update();
        }
    }

    checkConditions( productInfo ) {
        console.log( '>> shop.checkConditions: ' + JSON.stringify( productInfo ) );
        var e = document.getElementById( "current_cashier" ) as HTMLSelectElement;
        //var value = e.options[e.selectedIndex].value;
        this.cashier = e.options[e.selectedIndex].text;
        if ( this.cashier.length == 0 ) {
            this.presentPromptSelectCashier();
        } else {
            if ( this.shoppingCart.hasProduct( productInfo.productName ) ) {
                this.presentPromptAlreadyInShoppingCart();
            } else {
                this.addToShoppingCart( productInfo );
            }
        }
    }

    onGivenAmountUpdated() {
        console.log( '>> shop.onGivenAmountUpdated' );
        this.cashBack = this.givenAmount - this.totalSum;
    }

    removeProduct( productName, i ) {
        console.log( 'removeFromCart: ' + productName + ", index: " + i );
        this.shoppingCart.removeProduct( i );
        this.update();
    }

    increase( item, i ) {
        console.log( 'increaseItem: ' + item.productName + ", index: " + i );
        if ( item.quantity >= item.amountInStock ) {
            this.presentPromptNotEnoughInStock( i, item.amountInStock );
        } else {
            this.shoppingCart.increase( i );
            this.update();
        }
    }

    decrease( item, i ) {
        console.log( 'decreaseItem: ' + item.productName + ", index: " + i );
        //if ( item.quantity < 2 ) {
        //    this.presentPromptRemoveProduct( i );
        //} else {
        this.shoppingCart.decrease( i );
        this.update();
        //}
    }

    cashPayment() {
        console.log( 'cashPayment' );
        this.shoppingCart.setCashier( this.cashier );
        this.showPrompt( this.totalSum );
        console.log( 'Saved clicked, data: ' + this.moneyGiven.toString() );
    }

    async cardPayment(sum:number) {
        console.log( 'cardPayment' );
        this.transactionStatus = -1;
        this.shoppingCart.setCashier( this.cashier );
        //this.presentPromptPaymentCardInstructions(); // to be used only with old card reader
		this.restProvider.sendRequest( 'purchase',
									 { "amount": sum,
		                   			   "receiptId": this.currentState.lastReceiptNr } ).then(( result: any ) => {
            console.log( '>> card payment result received' );
            this.payments[3] = sum;
            this.cardPurchaseGoingOn = true;
        }, ( err ) => {
            console.log( 'error in purchase: ' + err );
        } )
	    .catch((result:any) => {
	        console.log('catch in purchase');
	    } )

        this.waitForCardPayment();
        console.log("==========card payment done");
    }

    async waitForCardPayment() {
	  for (let i = 0; i < 50 && this.transactionStatus !== 0; i++) {
         let promise = new Promise((res, rej) => {
             setTimeout(() => res("loop"), 2000)
          });

          // wait until the promise returns us a value
          let result = await promise;
          console.log(result)
  		  this.getPaymentStatus();
          console.log("loop");
       }
       this.ptStatusMessage = "Aikavalvontakatkaisu. Kirjaudu ulos ja sisään.";
    }

    clearPayments() {
        for ( var i = 0; i < this.payments.length; i++ ) {
            this.payments[i] = 0.0;
        }
        this.productNameInitials = "";
        this.productNumberInitials = "";
    }

    ownPurchase( handedTo, committee, receiver ) {
        console.log( 'ownPurchase: ' + handedTo + ', ' + committee + ', ' + receiver );

        this.presentLoading( "Talletetaan..." );
        this.shoppingCart.setCashier( this.cashier );
        //this.receiptContent = Array.from( this.cartContent );
        this.receiptTotalSumAsString = this.totalSumAsString;
        this.currentState.lastReceiptNr++;
        //console.log( 'receiptContent 1:  ' + JSON.stringify( this.receiptContent ) );

        var receiptData = {
            receiptNr: 0,
            cashier: '',
            items: []
        }

        receiptData.receiptNr = this.currentState.lastReceiptNr;
        receiptData.cashier = this.cashier;

        this.payments[5] = this.totalSum;

        var receiptItemData = {
            sum: 0,
            paymentMethod: 5,
            giftCard1Type: 0,
            handedTo: '',
            committee: '',
            receiver: '',
            originator: '',
            givenDate: '',
            valueBefore: 0,
            valueAfter: 0
        };

        receiptItemData.sum = this.payments[5];
        receiptItemData.paymentMethod = 5;
        receiptItemData.handedTo = handedTo;
        receiptItemData.committee = committee;
        receiptItemData.receiver = receiver;
        receiptData.items.push( receiptItemData );
        //this.receiptPaymentMethods.push(receiptItemData);

        this.shoppingCart.saveReceipt( receiptData );
        this.purchasedItems = Array.from(this.shoppingCart.getPurchaseData().productList);
        console.log('purchase data: ' + JSON.stringify(this.purchasedItems));
        //this.receiptPaymentMethods = Array.from(this.shoppingCart.getPurchaseData().receiptData.items);
        this.receiptPaymentMethods = receiptData.items;
        console.log('purchase data: ' + JSON.stringify(this.receiptPaymentMethods));
        this.shoppingCart.clearAll();
        this.clearPayments();
        this.clearCombinedPaymentData();
        this.update();
        $( "#shopping_cart_area" ).hide();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).show();
        $( "#soldItems" ).hide();
        //console.log( 'receiptContent 2:  ' + JSON.stringify( this.receiptContent ) );

        setTimeout(() => {
            this.finishLoading();
            this.presentLoading( "Haetaan tuotteet..." );
            setTimeout(() => {
                this.productList.getProductInfo();
                //this.getCurrentState();
                this.finishLoading();
            }, 2000 );
            this.finishLoading();
        }, 2000 );
    }

    onProductReturnClicked() {
        console.log( 'onProductReturnClicked' );
        this.combinedPayment();
    }

    combinedPaymentGuide() {
        console.log( 'combinedPayment' );

        var count = 1;

        var str = "";
        if ( this.payments[0] > 0 ) {
            str += ( count++ + ". Talleta oman ry:n lahjakortti<br>" );
        }
        if ( this.payments[1] > 0 ) {
            if ( this.giftCard2AmountAfter > 0 ) {
                str += ( count++ + ". Kirjoita SRK:n julkaisumyynnin lahjakorttiin jäljellä oleva käyttövara " +
                    this.giftCard2AmountAfter + " € ja anna kortti asiakkaalle<br>" );
            } else {
                str += ( count++ + ". Talleta SRK:n julkaisumyynnin lahjakortti<br>" );
            }
        }
        if ( this.payments[2] > 0 ) {
            str += ( count++ + ". Suorita käteisveloitus<br>" );
        }
        // with old pt:
        //if ( this.payments[3] > 0 ) {
        //    str += ( count++ + ". Suorita pankkikorttiveloitus<br>" );
        //}
        if ( this.payments[4] > 0 ) {
            str += ( count++ + ". Pyydä asiakasta suorttamaan MobilePay maksu, selitteeksi 'Julkaisumyynti'<br><br>" );
        }
        str += "Kun toimenpiteet suoritettu, paina \"Veloitukset suoritettu\"";

        this.presentPromptCombinedPaymentConfirmationGuide( str );
    }

    initCombinedPayment() {
        this.combinedPaymentGuide();
    }

    combinedPayment() {
        console.log( 'combinedPayment' );

        $( "#payment_data_area" ).hide();
        $( "#shopping_cart_area" ).show();

        this.presentLoading( "Talletetaan..." );
        this.shoppingCart.setCashier( this.cashier );
        //this.receiptContent = Array.from( this.cartContent );
        this.receiptTotalSumAsString = this.totalSumAsString;
        this.currentState.lastReceiptNr++;
        //console.log( 'receiptContent 1:  ' + JSON.stringify( this.receiptContent ) );

        var receiptData = {
            receiptNr: 0,
            cashier: '',
            items: []
        }

        receiptData.receiptNr = this.currentState.lastReceiptNr;
        receiptData.cashier = this.cashier;

        /************************** Ry gift card ***************************/
        if ( this.payments[0] > 0 ) {
            var receiptItemData0 = {
                sum: 0,
                paymentMethod: 0,
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptItemData0.sum = this.payments[0];
            receiptItemData0.paymentMethod = 0;
            receiptItemData0.giftCard1Type = this.giftCard1Type;
            receiptItemData0.receiver = this.giftCard1Receiver;
            receiptItemData0.givenDate = this.giftCard1PurchaseDate;
            receiptData.items.push( receiptItemData0 );
        }

        /************************** SRK gift card ***************************/
        if ( this.payments[1] > 0 ) {
            var receiptItemData1 = {
                sum: 0,
                paymentMethod: 1,
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptItemData1.sum = this.payments[1];
            receiptItemData1.paymentMethod = 1;
            receiptItemData1.receiver = this.giftCard2Receiver;
            receiptItemData1.originator = this.giftCard2Originator;
            receiptItemData1.givenDate = this.giftCard2PurchaseDate;
            receiptItemData1.valueBefore = this.giftCard2AmountBefore;
            receiptItemData1.valueAfter = this.giftCard2AmountAfter;
            receiptData.items.push( receiptItemData1 );
        }

        /************************** Cash ***************************/
        if ( this.payments[2] > 0 ) {
            var receiptItemData2 = {
                sum: 0,
                paymentMethod: 2,
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptItemData2.sum = this.payments[2];
            receiptItemData2.paymentMethod = 2;
            receiptData.items.push( receiptItemData2 );
        }

        /************************** Payment card ***************************/
        if ( this.payments[3] > 0 ) {
            var receiptItemData3 = {
                sum: 0,
                paymentMethod: 3,
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptItemData3.sum = this.payments[3];
            receiptItemData3.paymentMethod = 3;
            receiptData.items.push( receiptItemData3 );
        }

        /************************** MobilePay ***************************/
        if ( this.payments[4] > 0 ) {
            var receiptItemData4 = {
                sum: 0,
                paymentMethod: 4,
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptItemData4.sum = this.payments[4];
            receiptItemData4.paymentMethod = 4;
            receiptData.items.push( receiptItemData4 );
        }

        /************************** Product return ***************************/
        // Special case and a bit different handling
        if ( this.productReturnValue < 0 ) {
            var receiptItemData6 = {
                sum: 0,
                paymentMethod: 6,
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptItemData6.sum = 0 - this.productReturnValue;
            receiptItemData6.paymentMethod = 6;
            receiptData.items.push( receiptItemData6 );
        }

        this.shoppingCart.saveReceipt( receiptData );
        this.purchasedItems = Array.from(this.shoppingCart.getPurchaseData().productList);
        console.log('purchase data: ' + JSON.stringify(this.purchasedItems));
        //this.receiptPaymentMethods = Array.from(this.shoppingCart.getPurchaseData().receiptData.items);
        this.receiptPaymentMethods = receiptData.items;
        console.log('purchase data: ' + JSON.stringify(this.receiptPaymentMethods));
        this.shoppingCart.clearAll();
        this.clearPayments();
        this.clearCombinedPaymentData();
        this.update();
        $( "#shopping_cart_area" ).hide();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).show();
        $( "#soldItems" ).hide();
        //console.log( 'receiptContent 2:  ' + JSON.stringify( this.receiptContent ) );

        setTimeout(() => {
            this.finishLoading();
            this.presentLoading( "Haetaan tuotteet..." );
            setTimeout(() => {
                this.productList.getProductInfo();
                //this.getCurrentState();
                this.finishLoading();
            }, 2000 );
            this.finishLoading();
        }, 2000 );
    }

    handleReceipt() {
        console.log( 'handleReceipt' );
        $( "#shopping_cart_area" ).show();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#soldItems" ).hide();
    }

    showCombinedPayment() {
        console.log( 'showCombinedPayment' );
        $( "#shopping_cart_area" ).hide();
        $( "#payment_data_area" ).show();
        $( "#receipt_view" ).hide();
        $( "#soldItems" ).hide();
        this.toBePaid = this.totalSum;
        this.cardPaymentEnabled = false;
        this.cashPaymentEnabled = false;
        this.combinedPaymentEnabled = false;
        this.disableCombinedPaymentFields();
        this.validateCm();
    }

    clearCombinedPaymentData() {
        console.log( 'clearCombinedPaymentData' );

        this.toBePaid = 0;
        this.giftCard1Type = 0;
        this.giftCard1Receiver = "";
        this.giftCard1PurchaseDate = "";
        this.giftCard2Payment = 0.0;
        this.giftCard2Receiver = "";
        this.giftCard2PurchaseDate = "";
        this.giftCard2Originator = "";
        this.giftCard2AmountBefore = 0.0;
        this.giftCard2AmountAfter = 0.0;
        this.payments = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];

        ( <HTMLInputElement>document.getElementById( "cm1" ) ).checked = false;
        ( <HTMLInputElement>document.getElementById( "cm2" ) ).checked = false;
        ( <HTMLInputElement>document.getElementById( "cm3" ) ).checked = false;
        ( <HTMLInputElement>document.getElementById( "cm4" ) ).checked = false;
        ( <HTMLInputElement>document.getElementById( "cm5" ) ).checked = false;
    }

    cancelCombinedPayment() {
        console.log( 'cancelCombinedPayment' );
        $( "#payment_data_area" ).hide();
        $( "#shopping_cart_area" ).show();
        $( "#receipt_view" ).hide();
         $( "#soldItems" ).hide();
        for ( var i = 0; i < this.payments.length; i++ ) {
            this.payments[i] = 0.0;
        }
        this.cardPaymentEnabled = true;
        this.cashPaymentEnabled = true;
        this.combinedPaymentEnabled = true;

        this.clearCombinedPaymentData();
    }

    validateCm() {
        console.log( 'validateCm' );
        var currentPayments = 0.0;
        for ( var i = 0; i < this.payments.length; i++ ) {
            currentPayments += this.payments[i];
        }
        this.toBePaid = this.totalSum - currentPayments;
        this.confirmedPaymentEnabled = ( ( this.toBePaid == 0 ) &&
            this.cm1Valid() &&
            this.cm2Valid() );
        //var tbp = ( <HTMLInputElement>document.getElementById( "to_be_paid" ) ).value;
        //console.log( 'tbp: ' + tbp + ', this.toBePaid: ' + this.toBePaid );
        if ( this.toBePaid > 0 ) {
            document.getElementById( "to_be_paid" ).style.backgroundColor = "Red";
            document.getElementById( "to_be_paid_guide" ).style.color = "Red";
            document.getElementById( "to_be_paid_guide" ).style.fontWeight = "Bold";
        } else {
            document.getElementById( "to_be_paid" ).style.backgroundColor = "GreenYellow";
            document.getElementById( "to_be_paid_guide" ).style.color = "Black";
            document.getElementById( "to_be_paid_guide" ).style.fontWeight = "Normal";
        }
    }

    disableCombinedPaymentFields() {
        console.log( 'disableCombinedPaymentFields' );
        this.enableCm1Fields( false );
        this.enableCm2Fields( false );
    }

    /******************************************************************************************/
    /*** CM 1 Ry gift card***/

    cm10Listener() {
        var selected = ( <HTMLInputElement>document.getElementById( "cm1" ) ).checked;
        //console.log( 'cm10Listener ' + selected );
        if ( selected ) {
            var value = 20.0;
            if ( this.totalSum < 20 ) {
                value = this.totalSum;
            }
            ( <HTMLInputElement>document.getElementById( "cm11" ) ).value = value.toString();
            this.enableCm1Fields( true );
            this.payments[0] = value;
        } else {
            ( <HTMLInputElement>document.getElementById( "cm11" ) ).value = "0";
            this.payments[0] = 0;
            this.enableCm1Fields( false );
            this.clearCm1Fields();
        }

        if ( ( <HTMLInputElement>document.getElementById( "cm12" ) ).checked ) {
            console.log( 'Merkkipäivälahjakortti valittu' );
            this.giftCard1Type = 1;
        } else {
            console.log( 'Vauvalahjakortti valittu' );
            this.giftCard1Type = 0;
        }
        this.validateCm();
    }

    cm11Listener() {
        //console.log( 'cmListener' );
        this.cm10Listener();
    }

    giftCard1ReceiverChanged( $event ) {
        //console.log( 'giftCard1ReceiverChanged ' + $event );
        this.validateCm();
    }

    giftCard1PurchaseDateChanged( $event ) {
        //console.log( 'giftCard1PurchaseDateChanged ' + $event );
        this.validateCm();
    }

    cm1Valid() {
        //console.log( 'cm1Valid' );
        if ( ( <HTMLInputElement>document.getElementById( "cm1" ) ).checked ) {
            if ( ( this.giftCard1Receiver.length > 0 ) &&
                ( this.giftCard1PurchaseDate.length > 0 ) ) {
                return true;
            }

        } else {
            return true;
        }
    }

    enableCm1Fields( enabled ) {
        //console.log( 'enableCm1Fields' );
        ( <HTMLInputElement>document.getElementById( "cm11" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm12" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm13" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm14" ) ).disabled = !enabled;

    }

    clearCm1Fields() {
        //console.log( 'clearCm1Fields' );
        this.giftCard1Receiver = "";
        this.giftCard1PurchaseDate = "";
    }

    /******************************************************************************************/
    /*** CM 2 SRK gift card ***/

    cm20Listener() {
        //console.log( 'cm20Listener' );
        var selected = ( <HTMLInputElement>document.getElementById( "cm2" ) ).checked;
        //console.log( 'cm20Listener ' + selected );
        if ( selected ) {
            this.enableCm2Fields( true );
        } else {
            this.payments[1] = 0;
            this.enableCm2Fields( false );
            this.clearCm2Fields();

        }
        ( <HTMLInputElement>document.getElementById( "cm21" ) ).value = "0";
        this.validateCm();
    }

    giftCard2ReceiverChanged( $event ) {
        //console.log( 'giftCard2ReceiverChanged ' + $event );
        this.validateCm();
    }

    cm21Listener( $event ) {
        //console.log( 'cm21Listener ' + $event );
        this.payments[1] = parseFloat( $event );
        this.giftCard2AmountAfter = this.giftCard2AmountBefore - this.payments[1];
        this.validateCm();
    }

    giftCard2OriginatorChanged( $event ) {
        //console.log( 'giftCard2OriginatorChanged ' + $event );
        this.validateCm();
    }

    giftCard2PurchaseDateChanged( $event ) {
        //console.log( 'giftCard2PurchaseDateChanged ' + $event );
        this.validateCm();
    }

    giftCard2AmountBeforeChanged( $event ) {
        //console.log( 'giftCard2AmountBeforeChanged ' + $event );
        this.giftCard2AmountAfter = this.giftCard2AmountBefore - this.payments[1];
        this.validateCm();
    }

    giftCard2AmountAfterChanged( $event ) {
        //console.log( 'giftCard2AmountAfterChanged ' + $event );
        this.validateCm();
    }

    cm2Valid() {
        console.log( 'cm2valid' );
        if ( ( <HTMLInputElement>document.getElementById( "cm2" ) ).checked ) {
            if ( ( this.payments[1] > 0 ) &&
                ( this.giftCard2Receiver.length > 0 ) &&
                ( this.giftCard2Originator.length > 0 ) &&
                ( this.giftCard2PurchaseDate.length > 0 ) &&
                ( this.giftCard2AmountBefore > 0 ) &&
                ( this.giftCard2AmountAfter >= 0 ) ) {
                console.log( 'cm2valid: true' );
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    enableCm2Fields( enabled ) {
        //console.log( 'enableCm2Fields' );
        ( <HTMLInputElement>document.getElementById( "cm21" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm22" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm23" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm24" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm25" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm26" ) ).disabled = !enabled;
    }

    clearCm2Fields() {
        //console.log( 'clearCm2Fields' );
        this.giftCard2Payment = 0;
        this.giftCard2Receiver = "";
        this.giftCard2Originator = "";
        this.giftCard2PurchaseDate = "";
        this.giftCard2AmountBefore = 0;
        this.giftCard2AmountAfter = 0;
    }

    /******************************************************************************************/
    /*** CM 3 Cash ***/

    cm30Listener() {
        var selected = ( <HTMLInputElement>document.getElementById( "cm3" ) ).checked;
        console.log( 'cm30Listener ' + selected );
        if ( selected ) {
            ( <HTMLInputElement>document.getElementById( "cm31" ) ).disabled = false;
        } else {
            ( <HTMLInputElement>document.getElementById( "cm31" ) ).disabled = true;
            ( <HTMLInputElement>document.getElementById( "cm31" ) ).value = "0";
            this.payments[2] = 0;

        }
        this.validateCm();
    }

    cm31Listener( $event ) {
        console.log( 'cm31Listener ' + $event );
        this.payments[2] = parseFloat( $event );
        this.validateCm();
    }

    /******************************************************************************************/
    /*** CM 4 Payment card ***/

    cm40Listener() {
        var selected = ( <HTMLInputElement>document.getElementById( "cm4" ) ).checked;
        console.log( 'cm40Listener ' + selected );
        if ( selected ) {
            ( <HTMLInputElement>document.getElementById( "cm41" ) ).disabled = false;
        } else {
            ( <HTMLInputElement>document.getElementById( "cm41" ) ).disabled = true;
            ( <HTMLInputElement>document.getElementById( "cm41" ) ).value = "0";
            this.payments[3] = 0;

        }
        this.validateCm();
    }

    cm41Listener( $event ) {
        console.log( 'cm41Listener ' + $event );
        this.payments[3] = parseFloat( $event );
        this.validateCm();
    }

    /******************************************************************************************/
    /*** CM 5 MobilePay ***/

    cm50Listener() {
        var selected = ( <HTMLInputElement>document.getElementById( "cm5" ) ).checked;
        console.log( 'cm50Listener ' + selected );
        if ( selected ) {
            ( <HTMLInputElement>document.getElementById( "cm51" ) ).disabled = false;
        } else {
            ( <HTMLInputElement>document.getElementById( "cm51" ) ).disabled = true;
            ( <HTMLInputElement>document.getElementById( "cm51" ) ).value = "0";
            this.payments[4] = 0;

        }
        this.validateCm();
    }

    cm51Listener( $event ) {
        console.log( 'cm51Listener ' + $event );
        this.payments[4] = parseFloat( $event );
        this.validateCm();
    }

    /******************************************************************************************/

    getSoldItems() {
        this.restProvider.sendRequest( 'sold_items', [] ).then(( result: any ) => {
            this.soldItems = JSON.parse( result.result );
            console.log( 'soldItems: ' + JSON.stringify( this.soldItems ) );
        }, ( err ) => {
            console.log( err );
        } );
    }
    
    onCheckPayments() {
        console.log( 'onCheckPayments' );
        $( "#shopping_cart_area" ).hide();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#soldItems" ).show();
        this.getSoldItems();
    }

    onPurchaseSelected( productName, index ) {
        console.log( '>> shop.onPurchaseSelected: ' + productName + ' index: ' + index );
    }

    closePurchasedItemsView() {
        $( "#shopping_cart_area" ).show();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#soldItems" ).hide();
    }

    sendEmail() {
        console.log( 'sendEmail' );
        this.restProvider.sendRequest( 'send_email', [] ).then(( result: any ) => {
            console.log( '>> mail sent' );
        }, ( err ) => {
            console.log( 'error in sending mail: ' + err );
        } )
		.catch((result:any) => {
	    	console.log('catch in seding email: ' + result.result);
		} )
    }

    cancelPurchase() {
        console.log( 'cancelPurchase' );
        this.shoppingCart.clearAll();
        this.update();
    }

    checkIfCardPaymentEnabled() {
        return (!this.cardPaymentEnabled || !this.ptConnected);
    }

    checkIfCashPaymentEnabled() {
        return !this.cashPaymentEnabled;
    }

    checkIfGiftCartPaymentEnabled() {
        return !this.combinedPaymentEnabled;
    }

    checkIfConfirmedPaymentEnabled() {
        return !this.confirmedPaymentEnabled;
    }

    update() {
        console.log( 'update' );
        this.productsInCart = 0;
        this.productsInReturnBasket = 0;
        this.productReturnValue = 0;
        this.totalSum = this.shoppingCart.totalSum;
        this.totalSumAsString = this.shoppingCart.totalSum.toFixed( 2 );
        ( <HTMLInputElement>document.getElementById( "product_return_button" ) ).disabled = true;

        for ( var i = 0; i < this.cartContent.length; i++ ) {
            console.log( 'cart content ' + JSON.stringify( this.cartContent[i] ) );
            if ( this.cartContent[i].total > 0 ) {
                this.productsInCart++;
            } else if ( this.cartContent[i].total < 0 ) {
                this.productReturnValue += this.cartContent[i].total;
                this.productsInReturnBasket++;
            }
        }

        if ( this.totalSum > 0 ) {
            this.cardPaymentEnabled = true;
            this.cashPaymentEnabled = true;
            this.combinedPaymentEnabled = true;
            this.shoppingCartReturnBasket = "";
        } else {
            this.cardPaymentEnabled = false;
            this.cashPaymentEnabled = false;
            this.combinedPaymentEnabled = false;
            this.shoppingCartReturnBasket = "";
        }
        if ( this.productsInReturnBasket > 0 ) {
            this.shoppingCartReturnBasket = "Palautettavia tuotteita: " +
                this.productsInReturnBasket + " kpl, palautuksen arvo: " +
                ( 0 - this.productReturnValue ).toFixed( 2 ) + " euroa";
            if ( this.totalSum <= 0 ) {
                ( <HTMLInputElement>document.getElementById( "product_return_button" ) ).disabled = false;
            }
        } else {
            this.shoppingCartReturnBasket = "";
        }
    }

    saveChat() {
        console.log( 'saveChat' );
        if ( this.chatMessage.length > 0 ) {
            this.chat.message = this.chatMessage;
            this.chat.from = this.cashier;
            var entry = { from: "", message: "" };
            entry.from = this.chat.from;
            entry.message = this.chat.message;
            this.chatMessages.push( entry );
            this.restProvider.sendRequest( 'addchat', this.chat ).then(( result: any ) => {
            	console.log( '>> chat sent' );
        	}, ( err ) => {
            	console.log( 'error in sending chat: ' + err );
        	} )
			.catch((result:any) => {
	    		console.log('catch in sending chat: ' + result.result);
			} );
            setTimeout(() => {
                this.presentLoading( "Haetaan..." );
                this.scrollToEnd();
                this.finishLoading();
            }, 1000 );
        }
    }

    getChat() {
        console.log( '>> home.getChat' );
        this.restProvider.sendRequest( "chat", [] ).then(( result: any ) => {
            console.log( '>> result received' );
            this.chatMessages = JSON.parse( result.result );
            //console.log('chat messages: ' + JSON.stringify(this.chatMessages));
            //console.log('count: ' + this.chatMessages.length);
            setTimeout(() => {
                //this.presentLoading( "Haetaan..." );
                this.scrollToEnd();
                this.finishLoading();
            }, 1000 );
        }, ( err ) => {
            this.finishLoading();
            console.log( err );
        } );
    }

    scrollToEnd() {
        console.log( '>> home.scrollToEnd ' );
        var element = document.getElementById( "chat" + ( this.chatMessages.length - 1 ).toString() );
        element.scrollIntoView( { block: "end" } );
    }

    presentPromptSelectCashier() {
        let alert = this.alertController.create( {
            title: 'Aseta kassa ensin',
            buttons: [
                {
                    text: 'Ok',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                    }
                }
            ]
        } );
        alert.present();
    }
    
    presentPromptWaitUntilPTConnected() {
        let alert = this.alertController.create( {
            title: 'Odota kunnes maksupääteyhteys on muodostettu',
            buttons: [
                {
                    text: 'Ok',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                    }
                }
            ]
        } );
        alert.present();
    }
    
    presentPromptDoPaymentCardPayment() {
        let alert = this.alertController.create( {
            title: 'Suorita sitten pankkikorttiveloitus.',
            buttons: [
                {
                    text: 'Siirrä maksu maksupäätteelle',
                    handler: () => {
                        console.log( 'Siirrä maksu maksupäätteelle' );
                        this.cardPayment(this.payments[3]);
                    }
                }
            ]
        } );
        alert.present();
    }

    presentPromptNotEnoughInStock( i, amountInStock ) {
        let alert = this.alertController.create( {
            title: 'Tarkista saatavuus',
            message: "Varastosaldon mukaan tuotetta on vain " + amountInStock + " kpl",
            buttons: [
                {
                    text: 'Vahvista osto',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                        this.shoppingCart.increase( i );
                    }
                },
                {
                    text: 'Peruuta',
                    handler: () => {
                        console.log( 'Cancel' );
                    }
                }
            ]
        } );
        alert.present();
    }

    presentPromptRemoveProduct( i ) {
        let alert = this.alertController.create( {
            title: 'Poistetaanko tuote ostoskorista?',
            buttons: [
                {
                    text: 'Ok',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                        this.shoppingCart.decrease( i );
                    }
                },
                {
                    text: 'Peruuta',
                    handler: () => {
                        console.log( 'Cancel' );
                    }
                }
            ]
        } );
        alert.present();
    }

    // could be used if pt terminal not connected
    presentPromptPaymentCardInstructions() {
        let alert = this.alertController.create( {
            title: 'Syötä summa ' + this.totalSum + ' maksupäätteeseen',
            buttons: [
                {
                    text: 'Ok',
                    handler: () => {
                        console.log( 'Confirm card payment Ok' );
                        this.payments[3] = this.totalSum;
                        this.combinedPayment();
                    }
                },
                {
                    text: 'Peruuta',
                    handler: () => {
                        console.log( 'Card payment cancelled' );
                    }
                }
            ]
        } );
        alert.present();
    }

    showPrompt( totalSum ) {
        const prompt = this.alertController.create( {
            title: 'Maksettavaa: ' + totalSum + '€',
            message: "Kirjoita alle asiakkaan antama summa ja paina \"Kirjoitettu summa\" " +
            "tai valitse jokin pikavalintavahtoehdoista (10€, 20€, 50€, Tasaraha)",
            inputs: [
                {
                    name: 'Money',
                    type: 'number',
                    placeholder: 'Asiakkaan antama summa'
                }
            ],
            buttons: [
                {
                    text: 'Kirjoitettu summa',
                    handler: data => {
                        this.moneyGiven = data.Money;
                        console.log( 'Saved clicked, data: ' + this.moneyGiven.toString() );
                        if ( this.moneyGiven > this.totalSum ) {
                            this.showPrompt2( this.moneyGiven - this.totalSum );
                        } else if ( this.moneyGiven == this.totalSum ) {
                            this.payments[2] = this.totalSum;
                            this.combinedPayment();
                        } else {
                            this.showPrompt3( this.totalSum, this.moneyGiven );
                        }
                    },
                },
                {
                    text: '10 e',
                    handler: data => {
                        this.moneyGiven = data.Money;
                        console.log( 'Saved clicked, data: ' + this.moneyGiven.toString() );
                        this.showPrompt2( 10 - this.totalSum );
                    },
                },
                {
                    text: '20 e',
                    handler: data => {
                        this.moneyGiven = data.Money;
                        console.log( 'Saved clicked, data: ' + this.moneyGiven.toString() );
                        this.showPrompt2( 20 - this.totalSum );
                    },
                },
                {
                    text: '50 e',
                    handler: data => {
                        this.moneyGiven = data.Money;
                        console.log( 'Saved clicked, data: ' + this.moneyGiven.toString() );
                        this.showPrompt2( 50 - this.totalSum );
                    },
                },
                {
                    text: 'Tasaraha',
                    handler: data => {
                        this.moneyGiven = data.Money;
                        console.log( 'Saved clicked, data: ' + this.moneyGiven.toString() );
                        this.payments[2] = this.totalSum;
                        this.combinedPayment();
                    },
                },
                {
                    text: 'Peruuta',
                    handler: data => {
                        console.log( 'Cancel clicked' );
                    }
                },
            ]
        } );
        prompt.present();
    }

    showPrompt2( moneyback ) {
        const prompt = this.alertController.create( {
            title: 'Takaisin ' + moneyback.toString() + ' e',
            buttons: [
                {
                    text: 'OK',
                    handler: data => {
                        this.payments[2] = this.totalSum;
                        this.combinedPayment();
                    }
                }
            ]
        } );
        prompt.present();
    }

    showPrompt3( totalsum, givensum ) {
        const prompt = this.alertController.create( {
            title: 'Annuettu summa ' + givensum.toString() + 'e ei riitä loppusummaan '
            + totalsum + 'e , syötä maksu uudestaan',
            buttons: [
                {
                    text: 'Peruuta nykyinen maksu',
                    handler: data => {
                        //console.log('Saved clicked, data: ' + JSON.stringify(data.Money));
                    }
                }
            ]
        } );
        prompt.present();
    }

    presentPromptItemsInShoppingCart() {
        let alert = this.alertController.create( {
            title: 'Haluatko kirjautua ulos?',
            message: "Ostoskorissa on tuotteita! Ne poistetaan ostoskorista jos kirjaudut ulos." +
            "(Ostoskori ei tyhjene jos vain haluat vaihtaa käyttäjää.)",
            buttons: [
                {
                    text: 'Kirjaudu ulos',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                        var e = document.getElementById( "current_cashier" ) as HTMLSelectElement;
                        e.selectedIndex = 0;
                        this.shoppingCart.clearAll();
                        this.cancelCombinedPayment();
                    }
                },
                {
                    text: 'Peruuta',
                    handler: () => {
                        console.log( 'Cancel' );
                    }
                }
            ]
        } );
        alert.present();
    }

    presentPromptNoItemsInStock( productInfo ) {
        let alert = this.alertController.create( {
            title: 'Tarkista tuotteen saatavuus',
            message: "Varastokirjanpidon mukaan tuote on loppu",
            buttons: [
                {
                    text: 'Laita silti ostoskoriin',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                        this.shoppingCart.addProduct( productInfo );
                        this.update();
                    }
                },
                {
                    text: 'Peruuta',
                    handler: () => {
                        console.log( 'Cancel' );
                    }
                }
            ]
        } );
        alert.present();
    }

    presentPromptSendReport() {
        let alert = this.alertController.create( {
            title: 'Lähetetäänko päivän päätösraportti?',
            message: "Valitse \"Lähtetä\" jos myynti päätetään. Tämä on normaali valinta myyntipäivän päätteeksi.<br><br>" +
            "Valitse \"Älä lähetä\" jos myynti jatkuu tai myyntiä ei ole ollut.<br>" +
            "Vastaanottaja: " + this.reportProvider.getReportingAddress(),
            buttons: [
                {
                    text: 'Lähetä',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                        this.reportProvider.sendReports();
                    }
                },
                {
                    text: 'Älä lähetä',
                    handler: () => {
                        console.log( 'Cancel' );
                    }
                }
            ]
        } );
        alert.present();
    }

    presentPromptCombinedPaymentGuide() {
        let alert = this.alertController.create( {
            title: 'Maksutapojen yhdistelmä',
            message: "1. Valitse asiakkaan haluamat maksutavat vasemmalla olevista valintaruuduista<br><br>" +
            "2. Kirjoita valittujen maksutapojen Veloitus-kenttään veloituksen määrä ko. maksutavalla<br><br>" +
            "3. <b>Täytä kaikki tiedot valituista maksutavoista</b><br><br>." +
            "4. Paina lopuksi \"Vahvista maksu\""
            ,
            buttons: [
                {
                    text: 'Sulje ohje',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                    }
                }
            ]
        } );
        alert.present();
    }

    presentPromptCombinedPaymentConfirmationGuide( str ) {
        let alert = this.alertController.create( {
            title: 'Maksutapojen yhdistelmä',
            message: str,
            buttons: [
                {
                    text: 'Veloitukset suoritettu',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                        //this.combinedPayment(); // needed if old pt 
                        if ( this.payments[3] > 0 ) {
                            this.presentPromptDoPaymentCardPayment();
                        }
                    }
                },
                {
                    text: 'Peru veloitus',
                    handler: () => {
                        console.log( 'Cancel' );
                    }
                }
            ]
        } );
        alert.present();
    }

    presentPromptOwnPurchase() {
        let alert = this.alertController.create( {
            title: 'Ry:n oma osto',
            message: 'Jos tuote tai tuotteet otetaan Ry:n nimissä (esim lahjaksi annettavaksi) ' +
            'tai Ry:n käyttöön, kirjaa alle pyydetyt tiedot (toimikunta voi olla sama kuin tuotteen saaja joissain tapauksessa).',
            inputs: [
                {
                    name: 'TakenBy',
                    type: 'text',
                    placeholder: 'Tuotteen hakijan nimi'
                },
                {
                    name: 'Committee',
                    type: 'text',
                    placeholder: 'Toimikunta'
                },
                {
                    name: 'Receiver',
                    type: 'text',
                    placeholder: 'Tuotteen saaja'
                }
            ],
            buttons: [
                {
                    text: 'Vahvista',
                    handler: data => {
                        console.log( 'Confirm Ok' );
                        this.ownPurchase( data.TakenBy, data.Committee, data.Receiver );
                    }
                },
                {
                    text: 'Peru',
                    handler: () => {
                        console.log( 'Cancel' );
                    }
                }
            ]
        } );
        alert.present();
    }

    presentPromptAlreadyInShoppingCart() {
        let alert = this.alertController.create( {
            title: 'Tuote on jo ostoskorissa',
            message: "Voit lisätä tuotteiden määrää ostoskorin tuoterivillä painamalla +:lla merkittyä nappia.",
            buttons: [
                {
                    text: 'Sulje ohje',
                    handler: () => {
                        console.log( 'Confirm Ok' );
                    }
                }
            ]
        } );
        alert.present();
    }

    presentLoading( text ) {
        this.loadingIndicator = this.loadingCtrl.create( {
            content: text
            //duration: 3000;
        } );
        this.loadingIndicator.present();
    }

    finishLoading() {
        this.loadingIndicator.dismiss();
    }
/*
	connectPt() {
        console.log('connectPt');
		if (!this.ptConnectionInitiated) {
			this.ptConnectionInitiated = true;
			this.ptConnectionTerminated = false;
            this.restProvider.connectToPT().then(( result: any ) => {
                if (!this.ptConnectionTerminated) {
                    this.startPtConnectionPoll();
                }
            }, ( err ) => {
                console.log( 'error in connect: ' + err );
            } )
            .catch((result:any) => {
                console.log('catch in connect');
            } )
      	}
	}
 */
    connectToPt() {
        console.log('connectToPt');
        if (!this.ptConnectionInitiated) {
            this.ptConnectionInitiated = true;
            this.ptConnectionTerminated = false;
            this.restProvider.connectToPT().then(( result: any ) => {
                if (!this.ptConnectionTerminated) {
                    setTimeout(() => {
                        this.getPtConnectionStatus();
                    }, 5000 );
                }
            }, ( err ) => {
                console.log( 'error in connect: ' + err );
            } )
            .catch((result:any) => {
                console.log('catch in connect');
            } )
        }
    }
 
	disconnectPt() {
		if (this.ptConnectionInitiated) {
    		console.log('disconnectPt');
            this.stopPtConnectionPoll();
            this.ptConnectionInitiated = false;
		    this.ptConnectionTerminated = true;
    		this.restProvider.disconnectPT().then(( result: any ) => {
        		console.log( '>> result received' );
        		// update connection status only after timeout to give time for state change
	    		setTimeout(() => {
          			this.getPtConnectionStatus();
        		}, 5000 );
      		}, ( err ) => {
        		console.log( 'error in disconnect: ' + err );
      		})
	  		.catch((result:any) => {
	    		console.log('catch in disconnect');
	  		})
		}
    }

	getPtConnectionStatus() {
		console.log( 'getPtConnectionStatus' );
        this.restProvider.sendRequest( 'get_pt_status', [] ).then(( result: any ) => {
            console.log( '>> PT status received: ' + result.result);
			const ptStatus = JSON.parse(result.result);
			const ptConnectionStatus = ptStatus.wsstatus;
			this.ptStatusMessage = ptStatus.posMessage;
            this.ptConnected = false;
            ( <HTMLInputElement>document.getElementById( "cm4" ) ).disabled = true;
            ( <HTMLInputElement>document.getElementById( "cm41" ) ).disabled = true;
			console.log("ptConnectionStatus: " + ptConnectionStatus);
			switch (ptConnectionStatus) {
				case -1: // unknown
					this.ptStatusIcon = "remove-circle";
					this.ptStatusIconColor = "dark";
					break;
				case 0: // connecting
					this.ptStatusIcon = "help";
					this.ptStatusIconColor = "dark";
                    //this.stopPtConnectionPoll();
					break;
				case 1: // connected
                    this.ptConnected = true;
					this.ptStatusIcon = "swap";
					this.ptStatusIconColor = "secondary";
                    this.stopPtConnectionPoll();
                    ( <HTMLInputElement>document.getElementById( "cm4" ) ).disabled = false;
                    ( <HTMLInputElement>document.getElementById( "cm41" ) ).disabled = false;
                    console.log(">> ptConnected");
					break;
				case 2: // closing
					this.ptStatusIcon = "close-circle";
					this.ptStatusIconColor = "danger";
					break;
				case 3: // closed
					this.ptStatusIcon = "close-circle";
					this.ptStatusIconColor = "danger";
					break;
			}
        }, ( err ) => {
            console.log( 'error in getting PT status: ' + err );
        } )
		.catch((result:any) => {
	    	console.log('catch in getting PT status: ' + result.result);
		} )
	}

    getPaymentStatus() {
        console.log( 'getPaymentStatus' );
        this.restProvider.sendRequest( 'get_pt_status', [] ).then(( result: any ) => {
            console.log( '>> PT status received: ' + result.result);
            const ptStatus = JSON.parse(result.result);
            //const ptConnectionStatus = ptStatus.wsstatus;
            this.transactionStatus = ptStatus.transactionStatus;
            this.ptStatusMessage = ptStatus.posMessage;
            this.cardPaymentStatus = ptStatus.paymentStatus;
            
            // payment status
            switch(this.cardPaymentStatus) {
                case -1:
                    console.log("card payment ");
                break;
                case 0:
                    console.log("card payment ok");
                    if (this.cardPurchaseGoingOn) {
                        this.cardPurchaseGoingOn = false;
                        this.combinedPayment();
                    }
                break;
                case 1:
                    console.log("processing card payment...");
                break;
            }
            
        }, ( err ) => {
            console.log( 'error in getting PT status: ' + err );
        } )
        .catch((result:any) => {
            console.log('catch in getting PT status: ' + result.result);
        } )
    }

  startPtConnectionPoll() {
    console.log( '>> startPtConnectionPoll ');
    if (!this.paymentPollTimer) {
      this.connectToPt();
      this.paymentPollTimer = setInterval(() => {
        console.log( '>> PtConnectionPoll... ');
        this.ptConnectionInitiated = false;
        this.connectToPt();
      }, 10000 );
    }
  }
  
  stopPtConnectionPoll() {
    console.log('stopPtConnectionPoll');
    clearInterval(this.paymentPollTimer);
    this.paymentPollTimer = null;
  }
  
  startPaymentPoll() {
    if (!this.paymentPollTimer) {
      console.log('startPaymentPoll');
      this.paymentPollTimer = setInterval(() => {
        console.log( '>> paymentPollTimer fires');
        this.getPaymentStatus();
      }, 10000 );
    }
  }
  
  stopPaymentPoll() {
    console.log('stopPaymenPoll');
    clearInterval(this.paymentPollTimer);
    this.paymentPollTimer = null;
  }
}
