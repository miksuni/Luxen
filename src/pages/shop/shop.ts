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

    pageHeader: string = "Julkaisumyynti";

    productNumberInitials: string = "";
    productNameInitials: string = "";

    cartContent = [];
    purchasedItems = [];
    receiptPaymentInfo = [];

    searchResult: any;

    sites = [{ id: 'Lahti' }];
    cashiers: any;
    currentState: any;
    receiptNr: number = 0;
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

    ptInUse = false;
    ptConnected = false;
    ptStatusIcon = "alert";
    ptStatusIconColor = "dark";
    ptStatusMessage = "";
    ptConnectionInitiated = false;
    ptConnectionTerminated = false;

    paymentPollTimer; // not in use currently
    cardPurchaseGoingOn = false;
    lastPtMerchantReceipt: any;
    lastPtCustomerReceipt: any;

    soldItems: any;

    // for checking the last payment card purhcase
    lastCardPaymentAmount = 0;
    lastCardPaymentReceiptId = 0;
    cardPurchaseCheckingGoingOn = false;

    customerEmail = "";

    version = "Kassaversio 1.1.3";

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
    cashPay: number = 0.0;
    cardPay: number = 0.0;
    mobilePay: number = 0.0;
    payments = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]; // Used only with combined payment view

    givenAmount = 0;
    cashBack = 0;

    moneyGiven: number = 0.0;

    cardPaymentEnabled: boolean = false;
    cashPaymentEnabled: boolean = false;
    combinedPaymentEnabled: boolean = false;
    confirmedPaymentEnabled: boolean = false;

    cashier = "";

    loadingIndicator: any;

    username = "";
    password = "";
    loginError = "";
    testUser: boolean = false;
    menuDisabled: boolean = true;

    constructor( public navCtrl: NavController,
        public navParams: NavParams,
        public productList: ProductList,
        private shoppingCart: ShoppingcartProvider,
        private reportProvider: ReportProvider,
        public restProvider: RestProvider,
        private alertController: AlertController,
        public loadingCtrl: LoadingController ) {
    }

    ionViewDidLoad() {
        $( "#shopping_cart_area" ).hide();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#sold_items" ).hide();
        $( "#login_view" ).show();
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
        ( <HTMLInputElement>document.getElementById( "check_payments_button" ) ).disabled = true;
    }

    setPtInUse( ptInUse: boolean ) {
        this.ptInUse = ptInUse;
    }
    testModelChanged( $event ) {
    }

    login() {
        this.presentLoading( "Kirjaudutaan..." );
        this.loginError = "";
        this.restProvider.sendRequest( 'auth', { "auth": this.username + '+' + this.password } ).then(( result: any ) => {
            var response = JSON.parse( result.result );
            this.pageHeader = "Julkaisumyynti";
            this.getCurrentState( response );
        }, ( err ) => {
            console.log( 'error in authorization: ' + err );
        } ).catch(( result: any ) => {
            console.log( 'authorization failed' );
        } )
    }

    setTestUser( isTestUser ) {
        this.testUser = isTestUser;
        this.productList.setTestUser( isTestUser );
        this.reportProvider.setTestUser( isTestUser );
    }

    getCashiers() {
        this.restProvider.cashiers( [] ).then(( result: any ) => {
            var response = JSON.parse( result.result );
            this.finishLoading();
            this.cashiers = JSON.parse( result.result );
            $( "#login_view" ).hide();
            $( "#payment_data_area" ).hide();
            $( "#receipt_view" ).hide();
            $( "#sold_items" ).hide();
            $( "#shopping_cart_area" ).show();
            this.presentLoading( "Käynnistetään kassa ja haetaan tuotetiedot..." );
            if ( !this.testUser ) {
                this.productList.getProductInfo();
            } else {
                this.productList.getTestProductInfo();
            }
            this.shoppingCart.clearAll();
            this.cartContent = this.shoppingCart.getProducts();
            this.update();
            this.finishLoading();
        }, ( err ) => {
            console.log( err );
        } );
    }

    getCurrentState( response ) {
        this.setTestUser( false );
        this.restProvider.sendRequest( 'current_state', [] ).then(( result: any ) => {
            var currentState = JSON.parse( result.result );
            if ( currentState.length > 0 ) {
                this.currentState = currentState[0];
                if ( response["auth"] === "admin" ) {
                    this.menuDisabled = false;
                    this.getCashiers();
                } else if ( ( response["auth"] === "user" ) || ( response["auth"] === "tester" ) ) {
                    if ( this.currentState.currentCashier.length > 1 ) {
                        this.loginError = "Tällä hetkellä kassajärjestelmää käyttää " + this.currentState.currentCashier +
                            ", yritä hetken kuluttua uudelleen";
                        this.finishLoading();
                    } else {
                        if ( response["auth"] === "tester" ) {
                            this.setTestUser( true );
                            this.pageHeader = "Julkaisumyynti (TESTIKÄYTTÖ)";
                        }
                        this.getCashiers();
                    }
                } else {
                    this.loginError = "Käyttäjätunnus tai salasana on väärä";
                    this.finishLoading();
                }
            }

        }, ( err ) => {
            console.log( 'error in getting current state: ' + err );
        } ).catch(( result: any ) => {
            console.log( 'getting current state failed' );
        } )
    }

    onCashierSelected( $event ) {
        $( "#shopping_cart_area" ).show();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#sold_items" ).hide();
        var e = document.getElementById( "current_cashier" ) as HTMLSelectElement;
        if ( e.selectedIndex > 0 ) {
            ( <HTMLInputElement>document.getElementById( "logout_button" ) ).disabled = false;
            ( <HTMLInputElement>document.getElementById( "check_payments_button" ) ).disabled = false;
            this.setCurrentCashier( e.options[e.selectedIndex].text );
            if ( this.ptInUse ) {
                this.startPtConnectionPoll();
            }
        }
    }

    logout( forcedLogout ) {
        $( "#shopping_cart_area" ).hide();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#sold_items" ).hide();
        $( "#login_view" ).show();
        this.ptStatusMessage = "";
        this.productNameInitials = "";
        if ( this.shoppingCart.hasContent() && !forcedLogout ) {
            this.promptItemsInShoppingCart();
        } else {
            var e = document.getElementById( "current_cashier" ) as HTMLSelectElement;
            e.selectedIndex = 0;
            ( <HTMLInputElement>document.getElementById( "logout_button" ) ).disabled = true;
        }
        this.disconnectPt();
        this.cardPaymentEnabled = false;
        this.cashPaymentEnabled = false;
        this.combinedPaymentEnabled = false;
        ( <HTMLInputElement>document.getElementById( "check_payments_button" ) ).disabled = true;
    }

    onLogout() {
        this.logout( false );
        this.promptSendReport();
        this.setCurrentCashier( " " );

        //this.reportProvider.sendToBeOrderedReport();
        // TODO: ACTIVATE IN PRODUCTION
        /*this.orderList.products = this.productList.getProductsBelowCount(2);
        if (this.orderList.products.length > 0) {
            console.log('>> number of items to be ordered: ' + this.orderList.products.length);
            this.restProvider.sendRequest('send_email', this.orderList);
        }*/
    }

    onInputClicked() {
        var e = document.getElementById( "current_cashier" ) as HTMLSelectElement;
        this.cashier = e.options[e.selectedIndex].text;
        if ( this.cashier.length == 0 ) {
            this.promptSelectCashier();
        }
    }

    setCurrentCashier( cashier ) {
        this.restProvider.sendRequest( 'setcashier', { "cashier": cashier } ).then(( result: any ) => {
        }, ( err ) => {
            console.log( err );
        } );
    }

    onProductNumberUpdated() {
    }

    onProductNameUpdated() {
        var found = this.productList.getProductByWord( this.productNameInitials );
        this.searchResult = found;
    }

    onProductSelected( productName, index ) {
        this.checkConditions( this.searchResult[index] );
        // clear search result list
        this.searchResult.splice( 0, this.searchResult.length );
        this.productNameInitials = "";
    }

    addToShoppingCart( productInfo ) {
        if ( productInfo.amountInStock < 1 ) {
            this.promptNoItemsInStock( productInfo );
        } else {
            this.shoppingCart.addProduct( productInfo );
            this.update();
        }
    }

    checkConditions( productInfo ) {
        var e = document.getElementById( "current_cashier" ) as HTMLSelectElement;
        //var value = e.options[e.selectedIndex].value;
        this.cashier = e.options[e.selectedIndex].text;
        if ( this.cashier.length == 0 ) {
            this.promptSelectCashier();
        } else {
            if ( this.shoppingCart.hasProduct( productInfo.productName ) ) {
                this.promptAlreadyInShoppingCart();
            } else {
                this.addToShoppingCart( productInfo );
            }
        }
    }

    onGivenAmountUpdated() {
        this.cashBack = this.givenAmount - this.totalSum;
    }

    removeProduct( productName, i ) {
        this.shoppingCart.removeProduct( i );
        this.update();
    }

    increase( item, i ) {
        if ( item.quantity >= item.amountInStock ) {
            this.promptNotEnoughInStock( i, item.amountInStock );
        } else {
            this.shoppingCart.increase( i );
            this.update();
        }
    }

    decrease( item, i ) {
        this.shoppingCart.decrease( i );
        this.update();
    }

    cashPayment() {
        this.shoppingCart.setCashier( this.cashier );
        this.showPrompt( this.totalSum );
    }

    async cardPayment( sum: number ) {
        this.transactionStatus = -1;
        this.shoppingCart.setCashier( this.cashier );
        if ( !this.ptInUse ) {
            this.promptPaymentCardInstructions( sum ); // to be used only with old card reader
        } else {
            this.restProvider.sendRequest( 'purchase',
                {
                    "amount": sum,
                    "receiptId": this.currentState.lastReceiptNr
                } ).then(( result: any ) => {
                    this.payments[3] = sum;
                    this.cardPurchaseGoingOn = true;
                    // save for possible payment check
                    this.lastCardPaymentAmount = sum;
                    this.lastCardPaymentReceiptId = this.currentState.lastReceiptNr;
                }, ( err ) => {
                    console.log( 'error in purchase: ' + err );
                } )
                .catch(( result: any ) => {
                    console.log( 'catch in purchase' );
                } )

            this.waitForCardPayment();
        }
    }

    async checkLastCardPayment() {
        this.cardPurchaseCheckingGoingOn = true;
        this.restProvider.sendRequest( 'check_last_purchase',
            {
                "amount": this.lastCardPaymentAmount,
                "receiptId": this.lastCardPaymentReceiptId
            } ).then(( result: any ) => {
            }, ( err ) => {
                console.log( 'error in check: ' + err );
            } )
            .catch(( result: any ) => {
                console.log( 'catch in check' );
            } )

        this.waitForCardPaymentCheck();
    }

    async waitForCardPayment() {
        for ( let i = 0; i < 1000 && this.transactionStatus !== 0; i++ ) {
            let promise = new Promise(( res, rej ) => {
                setTimeout(() => res( "loop purchase response" ), 2000 )
            } );

            // wait until the promise returns us a value
            let result = await promise;
            this.getPaymentStatus();
        }
        this.ptStatusMessage = "Aikavalvontakatkaisu. Kirjaudu ulos ja sisään.";
    }

    async waitForCardPaymentCheck() {
        for ( let i = 0; i < 1000 && this.cardPurchaseCheckingGoingOn; i++ ) {
            let promise = new Promise(( res, rej ) => {
                setTimeout(() => res( "loop check response" ), 2000 )
            } );

            // wait until the promise returns us a value
            let result = await promise;
            this.getPaymentStatus();
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
        this.presentLoading( "Talletetaan..." );
        this.shoppingCart.setCashier( this.cashier );
        this.receiptTotalSumAsString = this.totalSumAsString;
        this.currentState.lastReceiptNr++;

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
            sumAsString: this.payments[5].toFixed( 2 ),
            paymentMethod: 5,
            paymentMethodDescription: "Ry:n oma osto",
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
        receiptItemData.handedTo = handedTo;
        receiptItemData.committee = committee;
        receiptItemData.receiver = receiver;
        receiptData.items.push( receiptItemData );

        this.shoppingCart.saveReceipt( receiptData );
        this.purchasedItems = Array.from( this.shoppingCart.getPurchaseData().productList );
        this.receiptPaymentInfo = receiptData.items;
        this.receiptNr = this.currentState.lastReceiptNr;
        this.shoppingCart.clearAll();
        this.clearPayments();
        this.clearCombinedPaymentData();
        this.update();
        $( "#shopping_cart_area" ).hide();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).show();
        $( "#sold_items" ).hide();

        setTimeout(() => {
            this.finishLoading();
            this.presentLoading( "Haetaan tuotteet..." );
            setTimeout(() => {
                if ( !this.testUser ) {
                    this.productList.getProductInfo();
                } else {
                    this.productList.getTestProductInfo();
                }
                this.finishLoading();
            }, 2000 );
            this.finishLoading();
        }, 2000 );
    }

    onProductReturnClicked() {
        this.combinedPayment();
    }

    combinedPaymentGuide() {

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
        /*if (!this.ptInUse) {
            // with old pt:
            if ( this.payments[3] > 0 ) {
                str += ( count++ + ". Suorita pankkikorttiveloitus<br>" );
            }
        }*/
        if ( this.payments[4] > 0 ) {
            str += ( count++ + ". Pyydä asiakasta suorttamaan MobilePay maksu, selitteeksi 'Julkaisumyynti'<br><br>" );
        }
        str += "Kun toimenpiteet suoritettu, paina \"Veloitukset suoritettu\"";

        this.promptCombinedPaymentConfirmationGuide( str );
    }

    initCombinedPayment() {
        this.combinedPaymentGuide();
    }

    combinedPayment() {
        $( "#payment_data_area" ).hide();
        $( "#shopping_cart_area" ).show();
        this.presentLoading( "Talletetaan..." );
        this.shoppingCart.setCashier( this.cashier );
        this.receiptTotalSumAsString = this.totalSumAsString;
        this.currentState.lastReceiptNr++;

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
                sum: this.payments[0],
                sumAsString: this.payments[0].toFixed( 2 ),
                paymentMethod: 0,
                paymentMethodDescription: "Ry:n lahjakortti",
                giftCard1Type: this.giftCard1Type,
                receiver: this.giftCard1Receiver,
                originator: '',
                givenDate: this.giftCard1PurchaseDate,
                valueBefore: 0,
                valueAfter: 0
            };
            receiptData.items.push( receiptItemData0 );
        }

        /************************** SRK gift card ***************************/
        if ( this.payments[1] > 0 ) {
            var receiptItemData1 = {
                sum: this.payments[1],
                sumAsString: this.payments[1].toFixed( 2 ),
                paymentMethod: 1,
                paymentMethodDescription: "SRK:n lahjakortti",
                giftCard1Type: 0,
                receiver: this.giftCard2Receiver,
                originator: this.giftCard2Originator,
                givenDate: this.giftCard2PurchaseDate,
                valueBefore: this.giftCard2AmountBefore,
                valueAfter: this.giftCard2AmountAfter
            };
            receiptData.items.push( receiptItemData1 );
        }

        /************************** Cash ***************************/
        if ( this.payments[2] > 0 ) {
            var receiptItemData2 = {
                sum: this.payments[2],
                sumAsString: this.payments[2].toFixed( 2 ),
                paymentMethod: 2,
                paymentMethodDescription: "Käteinen",
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptData.items.push( receiptItemData2 );
        }

        /************************** Payment card ***************************/
        if ( this.payments[3] > 0 ) {
            var receiptItemData3 = {
                sum: this.payments[3],
                sumAsString: this.payments[3].toFixed( 2 ),
                paymentMethod: 3,
                paymentMethodDescription: "Pankkikortti",
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptData.items.push( receiptItemData3 );
        }

        /************************** MobilePay ***************************/
        if ( this.payments[4] > 0 ) {
            var receiptItemData4 = {
                sum: this.payments[4],
                sumAsString: this.payments[4].toFixed( 2 ),
                paymentMethod: 4,
                paymentMethodDescription: "MobilePay",
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptData.items.push( receiptItemData4 );
        }

        /************************** Product return ***************************/
        // Special case and a bit different handling
        if ( this.productReturnValue < 0 ) {
            var receiptItemData7 = {
                sum: 0 - this.productReturnValue,
                sumAsString: ( 0 - this.productReturnValue ).toFixed( 2 ),
                paymentMethod: 7,
                paymentMethodDescription: "Tuotepalautus",
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptData.items.push( receiptItemData7 );
        }

        this.shoppingCart.saveReceipt( receiptData );
        this.purchasedItems = Array.from( this.shoppingCart.getPurchaseData().productList );
        this.receiptPaymentInfo = receiptData.items;
        this.receiptNr = this.currentState.lastReceiptNr;
        this.shoppingCart.clearAll();
        this.clearPayments();
        this.clearCombinedPaymentData();
        this.update();
        $( "#shopping_cart_area" ).hide();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).show();
        $( "#sold_items" ).hide();

        setTimeout(() => {
            this.finishLoading();
            this.presentLoading( "Haetaan tuotteet..." );
            setTimeout(() => {
                if ( !this.testUser ) {
                    this.productList.getProductInfo();
                } else {
                    this.productList.getTestProductInfo();
                }
                this.finishLoading();
            }, 2000 );
            this.finishLoading();
        }, 2000 );
    }

    sendReceipt() {
        var customerReceiptData = {
            receiptNr: this.receiptNr,
            totalSum: this.receiptTotalSumAsString,
            purchasedItems: this.purchasedItems,
            receiptPaymentInfo: this.receiptPaymentInfo,
            ptCustomerText: this.lastPtCustomerReceipt,
            recipient: this.customerEmail
        };
        this.reportProvider.sendReceipt( customerReceiptData );
        this.promptReceiptSent();
    }

    closeReceiptView() {
        $( "#shopping_cart_area" ).show();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#sold_items" ).hide();
        this.customerEmail = "";
    }

    onCustomerEmailUpdated() {
    }

    checkIfReceiptSendingEnabled() {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return !re.test( String( this.customerEmail ).toLowerCase() );
    }

    showCombinedPayment() {
        $( "#shopping_cart_area" ).hide();
        $( "#payment_data_area" ).show();
        $( "#receipt_view" ).hide();
        $( "#sold_items" ).hide();
        this.toBePaid = this.totalSum;
        this.cardPaymentEnabled = false;
        this.cashPaymentEnabled = false;
        this.combinedPaymentEnabled = false;
        this.disableCombinedPaymentFields();
        this.validateCm();
    }

    clearCombinedPaymentData() {

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
        this.lastPtCustomerReceipt = "";
        this.lastPtMerchantReceipt = "";

        ( <HTMLInputElement>document.getElementById( "cm1" ) ).checked = false;
        ( <HTMLInputElement>document.getElementById( "cm2" ) ).checked = false;
        ( <HTMLInputElement>document.getElementById( "cm3" ) ).checked = false;
        ( <HTMLInputElement>document.getElementById( "cm4" ) ).checked = false;
        ( <HTMLInputElement>document.getElementById( "cm5" ) ).checked = false;
    }

    cancelCombinedPayment() {
        $( "#payment_data_area" ).hide();
        $( "#shopping_cart_area" ).show();
        $( "#receipt_view" ).hide();
        $( "#sold_items" ).hide();
        for ( var i = 0; i < this.payments.length; i++ ) {
            this.payments[i] = 0.0;
        }
        this.cardPaymentEnabled = true;
        this.cashPaymentEnabled = true;
        this.combinedPaymentEnabled = true;

        this.clearCombinedPaymentData();
    }

    validateCm() {
        var currentPayments = 0.0;
        for ( var i = 0; i < this.payments.length; i++ ) {
            currentPayments += this.payments[i];
        }
        this.toBePaid = this.totalSum - currentPayments;
        this.confirmedPaymentEnabled = ( ( this.toBePaid == 0 ) &&
            this.cm1Valid() &&
            this.cm2Valid() );
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
        this.enableCm1Fields( false );
        this.enableCm2Fields( false );
    }

    /******************************************************************************************/
    /*** CM 1 Ry gift card***/

    cm10Listener() {
        var selected = ( <HTMLInputElement>document.getElementById( "cm1" ) ).checked;
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
            this.giftCard1Type = 1;
        } else {
            this.giftCard1Type = 0;
        }
        this.validateCm();
    }

    cm11Listener() {
        this.cm10Listener();
    }

    giftCard1ReceiverChanged( $event ) {
        this.validateCm();
    }

    giftCard1PurchaseDateChanged( $event ) {
        this.validateCm();
    }

    cm1Valid() {
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
        ( <HTMLInputElement>document.getElementById( "cm11" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm12" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm13" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm14" ) ).disabled = !enabled;

    }

    clearCm1Fields() {
        this.giftCard1Receiver = "";
        this.giftCard1PurchaseDate = "";
    }

    /******************************************************************************************/
    /*** CM 2 SRK gift card ***/

    cm20Listener() {
        var selected = ( <HTMLInputElement>document.getElementById( "cm2" ) ).checked;
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
        this.validateCm();
    }

    cm21Listener( $event ) {
        this.payments[1] = parseFloat( $event );
        this.giftCard2AmountAfter = this.giftCard2AmountBefore - this.payments[1];
        this.validateCm();
    }

    giftCard2OriginatorChanged( $event ) {
        this.validateCm();
    }

    giftCard2PurchaseDateChanged( $event ) {
        this.validateCm();
    }

    giftCard2AmountBeforeChanged( $event ) {
        this.giftCard2AmountAfter = this.giftCard2AmountBefore - this.payments[1];
        this.validateCm();
    }

    giftCard2AmountAfterChanged( $event ) {
        this.validateCm();
    }

    cm2Valid() {
        if ( ( <HTMLInputElement>document.getElementById( "cm2" ) ).checked ) {
            if ( ( this.payments[1] > 0 ) &&
                ( this.giftCard2Receiver.length > 0 ) &&
                ( this.giftCard2Originator.length > 0 ) &&
                ( this.giftCard2PurchaseDate.length > 0 ) &&
                ( this.giftCard2AmountBefore > 0 ) &&
                ( this.giftCard2AmountAfter >= 0 ) ) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    enableCm2Fields( enabled ) {
        ( <HTMLInputElement>document.getElementById( "cm21" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm22" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm23" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm24" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm25" ) ).disabled = !enabled;
        ( <HTMLInputElement>document.getElementById( "cm26" ) ).disabled = !enabled;
    }

    clearCm2Fields() {
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
        this.payments[2] = parseFloat( $event );
        this.validateCm();
    }

    /******************************************************************************************/
    /*** CM 4 Payment card ***/

    cm40Listener() {
        var selected = ( <HTMLInputElement>document.getElementById( "cm4" ) ).checked;
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
        this.payments[3] = parseFloat( $event );
        this.validateCm();
    }

    /******************************************************************************************/
    /*** CM 5 MobilePay ***/

    cm50Listener() {
        var selected = ( <HTMLInputElement>document.getElementById( "cm5" ) ).checked;
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
        this.payments[4] = parseFloat( $event );
        this.validateCm();
    }

    /******************************************************************************************/

    getSoldItems() {
        this.restProvider.sendRequest( 'sold_items', [] ).then(( result: any ) => {
            var items = JSON.parse( result.result );
            for ( var i = 0; i < items.length; i++ ) {
                const date = new Date( items[i].createdAt );
                items[i].timeStr = date.toLocaleTimeString();
            }
            this.soldItems = items;
            this.checkLastCardPayment();
        }, ( err ) => {
            console.log( err );
        } );
    }

    onCheckPayments() {
        $( "#shopping_cart_area" ).hide();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#sold_items" ).show();
        this.getSoldItems();
    }

    onPurchaseSelected( productName, index ) {
    }

    closePurchasedItemsView() {
        $( "#shopping_cart_area" ).show();
        $( "#payment_data_area" ).hide();
        $( "#receipt_view" ).hide();
        $( "#sold_items" ).hide();
    }

    sendEmail() {
        this.restProvider.sendRequest( 'send_email', [] ).then(( result: any ) => {
        }, ( err ) => {
            console.log( 'error in sending mail: ' + err );
        } )
            .catch(( result: any ) => {
                console.log( 'catch in seding email: ' + result.result );
            } )
    }

    cancelPurchase() {
        this.shoppingCart.clearAll();
        this.update();
    }

    checkIfCardPaymentEnabled() {
        if ( this.ptInUse )
            return ( !this.cardPaymentEnabled || !this.ptConnected );
        else
            return !this.cardPaymentEnabled;
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
        this.productsInCart = 0;
        this.productsInReturnBasket = 0;
        this.productReturnValue = 0;
        this.totalSum = this.shoppingCart.totalSum;
        this.totalSumAsString = this.shoppingCart.totalSum.toFixed( 2 );
        ( <HTMLInputElement>document.getElementById( "product_return_button" ) ).disabled = true;

        for ( var i = 0; i < this.cartContent.length; i++ ) {
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

    promptSelectCashier() {
        let alert = this.alertController.create( {
            title: 'Aseta kassa ensin',
            buttons: [
                {
                    text: 'Ok',
                    handler: () => {
                    }
                }
            ]
        } );
        alert.present();
    }

    promptWaitUntilPTConnected() {
        let alert = this.alertController.create( {
            title: 'Odota kunnes maksupääteyhteys on muodostettu',
            buttons: [
                {
                    text: 'Ok',
                    handler: () => {
                    }
                }
            ]
        } );
        alert.present();
    }

    promptDoPaymentCardPayment() {
        let alert = this.alertController.create( {
            title: 'Suorita sitten pankkikorttiveloitus.',
            buttons: [
                {
                    text: 'Siirrä maksu maksupäätteelle',
                    handler: () => {
                        this.cardPayment( this.payments[3] );
                    }
                }
            ]
        } );
        alert.present();
    }

    promptNotEnoughInStock( i, amountInStock ) {
        let alert = this.alertController.create( {
            title: 'Tarkista saatavuus',
            message: "Varastosaldon mukaan tuotetta on vain " + amountInStock + " kpl",
            buttons: [
                {
                    text: 'Vahvista osto',
                    handler: () => {
                        this.shoppingCart.increase( i );
                    }
                },
                {
                    text: 'Peruuta',
                    handler: () => {
                    }
                }
            ]
        } );
        alert.present();
    }

    promptRemoveProduct( i ) {
        let alert = this.alertController.create( {
            title: 'Poistetaanko tuote ostoskorista?',
            buttons: [
                {
                    text: 'Ok',
                    handler: () => {
                        this.shoppingCart.decrease( i );
                    }
                },
                {
                    text: 'Peruuta',
                    handler: () => {
                    }
                }
            ]
        } );
        alert.present();
    }

    // could be used if pt terminal not connected
    promptPaymentCardInstructions( sum: number ) {
        let alert = this.alertController.create( {
            title: 'Syötä summa ' + sum + ' e maksupäätteeseen',
            buttons: [
                {
                    text: 'Ok',
                    handler: () => {
                        this.payments[3] = sum;
                        this.combinedPayment();
                    }
                },
                {
                    text: 'Peruuta',
                    handler: () => {
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
                        this.showPrompt2( 10 - this.totalSum );
                    },
                },
                {
                    text: '20 e',
                    handler: data => {
                        this.moneyGiven = data.Money;
                        this.showPrompt2( 20 - this.totalSum );
                    },
                },
                {
                    text: '50 e',
                    handler: data => {
                        this.moneyGiven = data.Money;
                        this.showPrompt2( 50 - this.totalSum );
                    },
                },
                {
                    text: 'Tasaraha',
                    handler: data => {
                        this.moneyGiven = data.Money;
                        this.payments[2] = this.totalSum;
                        this.combinedPayment();
                    },
                },
                {
                    text: 'Peruuta',
                    handler: data => {
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
            title: 'Annettu summa ' + givensum.toString() + 'e ei riitä loppusummaan '
            + totalsum + 'e , syötä maksu uudestaan',
            buttons: [
                {
                    text: 'Peruuta nykyinen maksu',
                    handler: data => {
                    }
                }
            ]
        } );
        prompt.present();
    }

    promptItemsInShoppingCart() {
        let alert = this.alertController.create( {
            title: 'Haluatko kirjautua ulos?',
            message: "Ostoskorissa on tuotteita! Ne poistetaan ostoskorista jos kirjaudut ulos." +
            "(Ostoskori ei tyhjene jos vain haluat vaihtaa käyttäjää.)",
            buttons: [
                {
                    text: 'Kirjaudu ulos',
                    handler: () => {
                        var e = document.getElementById( "current_cashier" ) as HTMLSelectElement;
                        e.selectedIndex = 0;
                        ( <HTMLInputElement>document.getElementById( "logout_button" ) ).disabled = true;
                        this.shoppingCart.clearAll();
                        this.cancelCombinedPayment();
                    }
                },
                {
                    text: 'Peruuta',
                    handler: () => {
                    }
                }
            ]
        } );
        alert.present();
    }

    promptNoItemsInStock( productInfo ) {
        let alert = this.alertController.create( {
            title: 'Tarkista tuotteen saatavuus',
            message: "Varastokirjanpidon mukaan tuote on loppu",
            buttons: [
                {
                    text: 'Laita silti ostoskoriin',
                    handler: () => {
                        this.shoppingCart.addProduct( productInfo );
                        this.update();
                    }
                },
                {
                    text: 'Peruuta',
                    handler: () => {
                    }
                }
            ]
        } );
        alert.present();
    }

    promptSendReport() {
        let alert = this.alertController.create( {
            title: 'Lähetetäänko päivän päätösraportti?',
            message: "Valitse \"Lähtetä\" jos myynti päätetään. Tämä on normaali valinta myyntipäivän päätteeksi.<br><br>" +
            "Valitse \"Älä lähetä\" jos myynti jatkuu tai myyntiä ei ole ollut.<br>" +
            "Vastaanottaja: " + this.reportProvider.getReportingAddress(),
            buttons: [
                {
                    text: 'Lähetä',
                    handler: () => {
                        if ( !this.testUser ) {
                            this.reportProvider.sendReports();
                        }
                    }
                },
                {
                    text: 'Älä lähetä',
                    handler: () => {
                    }
                }
            ]
        } );
        alert.present();
    }

    promptCombinedPaymentGuide() {
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
                    }
                }
            ]
        } );
        alert.present();
    }

    promptCombinedPaymentConfirmationGuide( str ) {
        let alert = this.alertController.create( {
            title: 'Maksutapojen yhdistelmä',
            message: str,
            buttons: [
                {
                    text: 'Veloitukset suoritettu',
                    handler: () => {
                        if ( this.payments[3] > 0 ) {
                            if ( this.ptInUse ) {
                                this.promptDoPaymentCardPayment();
                            } else {
                                this.promptPaymentCardInstructions( this.payments[3] )
                            }
                        } else {
                            this.combinedPayment();
                        }
                    }
                },
                {
                    text: 'Peru veloitus',
                    handler: () => {
                    }
                }
            ]
        } );
        alert.present();
    }

    promptOwnPurchase() {
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
                        this.ownPurchase( data.TakenBy, data.Committee, data.Receiver );
                    }
                },
                {
                    text: 'Peru',
                    handler: () => {
                    }
                }
            ]
        } );
        alert.present();
    }

    promptAlreadyInShoppingCart() {
        let alert = this.alertController.create( {
            title: 'Tuote on jo ostoskorissa',
            message: "Voit lisätä tuotteiden määrää ostoskorin tuoterivillä painamalla +:lla merkittyä nappia.",
            buttons: [
                {
                    text: 'Sulje ohje',
                    handler: () => {
                    }
                }
            ]
        } );
        alert.present();
    }

    promptReceiptSent() {
        let alert = this.alertController.create( {
            title: 'Lähetetty',
            message: "Kuitti lähetetty osoitteeseen " + this.customerEmail,
            buttons: [
                {
                    text: 'Sulje ohje',
                    handler: () => {
                        this.closeReceiptView();
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

    connectToPt() {
        if ( !this.ptConnectionInitiated ) {
            this.ptConnectionInitiated = true;
            this.ptConnectionTerminated = false;
            this.restProvider.connectToPT().then(( result: any ) => {
                if ( !this.ptConnectionTerminated ) {
                    setTimeout(() => {
                        this.getPtConnectionStatus();
                    }, 5000 );
                }
            }, ( err ) => {
                console.log( 'error in connect: ' + err );
            } )
                .catch(( result: any ) => {
                    console.log( 'catch in connect' );
                } )
        }
    }

    disconnectPt() {
        if ( this.ptConnectionInitiated ) {
            this.stopPtConnectionPoll();
            this.ptConnectionInitiated = false;
            this.ptConnectionTerminated = true;
            this.restProvider.disconnectPT().then(( result: any ) => {
                // update connection status only after timeout to give time for state change
                setTimeout(() => {
                    this.getPtConnectionStatus();
                }, 5000 );
            }, ( err ) => {
                console.log( 'error in disconnect: ' + err );
            } )
                .catch(( result: any ) => {
                    console.log( 'catch in disconnect' );
                } )
        }
    }

    getPtConnectionStatus() {
        this.restProvider.sendRequest( 'get_pt_status', [] ).then(( result: any ) => {
            const ptStatus = JSON.parse( result.result );
            const ptConnectionStatus = ptStatus.wsstatus;
            this.ptStatusMessage = ptStatus.posMessage;
            this.ptConnected = false;
            ( <HTMLInputElement>document.getElementById( "cm4" ) ).disabled = true;
            ( <HTMLInputElement>document.getElementById( "cm41" ) ).disabled = true;
            switch ( ptConnectionStatus ) {
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
            .catch(( result: any ) => {
                console.log( 'catch in getting PT status: ' + result.result );
            } )
    }

    getPaymentStatus() {
        this.restProvider.sendRequest( 'get_pt_status', [] ).then(( result: any ) => {
            const ptStatus = JSON.parse( result.result );

            if ( ptStatus.connectionClosedByPeer ) {
                this.ptStatusMessage = "Yhteys maksupäätteeseen katkennut";
                return;
            }

            //const ptConnectionStatus = ptStatus.wsstatus;
            this.transactionStatus = ptStatus.transactionStatus;
            this.ptStatusMessage = ptStatus.posMessage;
            this.cardPaymentStatus = ptStatus.paymentStatus;

            // payment status
            switch ( this.cardPaymentStatus ) {
                case -1:
                    console.log( "error in getting pt status" );
                    break;
                case 0:
                    if ( this.cardPurchaseGoingOn ) {
                        this.cardPurchaseGoingOn = false;
                        this.combinedPayment();
                        this.restProvider.sendRequest( 'get_receipt_text', [] ).then(( result: any ) => {
                            var lastPtResult = JSON.parse( result.result );
                            this.lastPtMerchantReceipt = lastPtResult.merchantReceipt;
                            this.lastPtCustomerReceipt = lastPtResult.customerReceipt;
                        }, ( err ) => {
                            console.log( err );
                        } );
                    }
                    break;
                case 1:
                    console.log( "processing card payment..." );
                    break;
            }

            if ( this.cardPurchaseCheckingGoingOn ) {
                this.cardPurchaseCheckingGoingOn = false;
            }

        }, ( err ) => {
            console.log( 'error in getting PT status: ' + err );
        } )
            .catch(( result: any ) => {
                console.log( 'catch in getting PT status: ' + result.result );
            } )
    }

    startPtConnectionPoll() {
        if ( !this.paymentPollTimer ) {
            this.connectToPt();
            this.paymentPollTimer = setInterval(() => {
                this.ptConnectionInitiated = false;
                this.connectToPt();
            }, 10000 );
        }
    }

    stopPtConnectionPoll() {
        clearInterval( this.paymentPollTimer );
        this.paymentPollTimer = null;
    }
}
