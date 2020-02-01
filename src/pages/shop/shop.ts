import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProductList } from '../../providers/productlist/productlist';
import { ShoppingcartProvider } from '../../providers/shoppingcart/shoppingcart';
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
    receiptContent = [];
    searchResult: any;

    sites = [{ id: 'Lahti' }];
    cashiers: any;
    orderList = { products: [] };
    chat = { from: '', message: '' };
    chatMessages: any;
    chatMessage: string = "";
    //productInfo = { objectId:'', ISBN:'', productName:'', price:'', amountInStock:'', productCode:'', availableFromPublisher:'' };
    productsInCart = 0;
    totalSum: number = 0;
    totalSumAsString: string = "";
    receiptTotalSumAsString: string = "";


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
    cashPay: number = 0.0;
    cardPay: number = 0.0;
    payments = [0.0, 0.0, 0.0, 0.0];

    givenAmount = 0;
    cashBack = 0;

    moneyGiven: number = 0.0;

    cardPaymentEnabled: boolean = false;
    cashPaymentEnabled: boolean = false;
    giftCardPaymentEnabled: boolean = false;
    confirmedPaymentEnabled: boolean = false;

    cashier = "";

    loadingIndicator: any;

    constructor( public navCtrl: NavController,
        public navParams: NavParams,
        public productList: ProductList,
        private shoppingCart: ShoppingcartProvider,
        public restProvider: RestProvider,
        private alertController: AlertController,
        public loadingCtrl: LoadingController ) {
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
        document.getElementById( "receipt_view" ).style.visibility = "hidden";
        ( <HTMLInputElement>document.getElementById( "cm11" ) ).value = "0";
        ( <HTMLInputElement>document.getElementById( "cm21" ) ).disabled = true;
        ( <HTMLInputElement>document.getElementById( "cm21" ) ).value = "0";
        ( <HTMLInputElement>document.getElementById( "cm31" ) ).disabled = true;
        ( <HTMLInputElement>document.getElementById( "cm31" ) ).value = "0";
        ( <HTMLInputElement>document.getElementById( "cm41" ) ).disabled = true;
        ( <HTMLInputElement>document.getElementById( "cm41" ) ).value = "0";
        this.productList.getProductInfo();
        this.shoppingCart.clearAll();
        this.cartContent = this.shoppingCart.getProducts();
        this.getCashiers();
        this.getChat();
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
            //console.log('cashiers: ' + JSON.stringify(this.cashiers));
        }, ( err ) => {
            console.log( err );
        } );
    }

    // Works only wiht ion-select
    //onCashierChange($event){
    //    console.log('>> onCashierChange: ' + $event);
    //    this.cashier = $event;
    //    this.shoppingCart.setCashier(this.cashier);
    //}

    onLogout() {
        console.log( '>> shop.onLogout' );
        if ( this.shoppingCart.hasContent() ) {
            this.presentPromptItemsInShoppingCart();
        } else {
            var e = document.getElementById( "current_cashier" ) as HTMLSelectElement;
            e.selectedIndex = 0;
        }
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
        console.log( '>> shop.onProductNumberUpdated: ' + this.productNumberInitials );
        document.getElementById( "receipt_view" ).style.visibility = "hidden";
        if ( this.productNumberInitials.length > 0 ) {
            var found = this.productList.getProductProgressivelyByNumber( this.productNumberInitials );
            this.searchResult = found;
            console.log( '>> found: ' + found.length );
            console.log( '>> json: ' + JSON.stringify( found ) );
        }
    }

    onProductNameUpdated() {
        console.log( '>> shop.onProductNameUpdated: ' + this.productNameInitials );
        document.getElementById( "receipt_view" ).style.visibility = "hidden";
        var found = this.productList.getProductByName( this.productNameInitials );
        this.searchResult = found;
        console.log( '>> found: ' + found.length );
        console.log( '>> json: ' + JSON.stringify( found ) );
    }

    onProductSelected( productName, index ) {
        console.log( '>> shop.onProductSelected: ' + productName + ' index: ' + index );
        this.checkConditions( this.searchResult[index] );
        this.searchResult.splice( 0, this.searchResult.length )
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
            this.addToShoppingCart( productInfo );
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
        if ( item.quantity < 2 ) {
            this.presentPromptRemoveProduct( i );
        } else {
            this.shoppingCart.decrease( i );
            this.update();
        }
    }

    cashPayment() {
        console.log( 'cashPayment' );
        this.shoppingCart.setCashier( this.cashier );
        this.showPrompt( this.totalSum );
        console.log( 'Saved clicked, data: ' + this.moneyGiven.toString() );
        this.setPaymentMethod( "Käteinen" );
    }

    cardPayment() {
        console.log( 'cardPayment' );
        this.shoppingCart.setCashier( this.cashier );
        this.setPaymentMethod( "Maksukortti" );
        this.presentPromptPaymentCardInstructions();
    }

    clearPayments() {
        for ( var i = 0; i < this.payments.length; i++ ) {
            this.payments[i] = 0.0;
        }
    }

    // TODO: add receipt nr handling
    combinedPayment() {
        console.log( 'combinedPayment' );

        //this.setPaymentMethod("Lahjakortti");
        $( "#payment_data_area" ).hide();
        $( "#shopping_cart_area" ).show();

        this.presentLoading( "Talletetaan..." );
        this.shoppingCart.setCashier( this.cashier );
        this.receiptContent = Array.from( this.cartContent );
        this.receiptTotalSumAsString = this.totalSumAsString;

        var receiptData = {
            receiptNr: 0,
            cashier: '',
            items: []
        }

        receiptData.receiptNr = 2;
        receiptData.cashier = this.cashier;

        if ( this.payments[0] > 0 ) {
            var receiptItemData = {
                sum: 0,
                paymentMethod: 0,
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '2020-01-01T00:00:00.000Z',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptItemData.sum = this.payments[0];
            receiptItemData.paymentMethod = 0;
            receiptItemData.giftCard1Type = this.giftCard1Type;
            receiptItemData.receiver = this.giftCard1Receiver;
            receiptItemData.givenDate = this.giftCard1PurchaseDate;
            receiptData.items.push( receiptItemData );
        }
        if ( this.payments[1] > 0 ) {
            var receiptItemData = {
                sum: 0,
                paymentMethod: 1,
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '2020-01-01T00:00:00.000Z',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptItemData.sum = this.payments[1];
            receiptItemData.paymentMethod = 1;
            receiptItemData.receiver = this.giftCard2Receiver;
            receiptItemData.originator = this.giftCard2Originator;
            receiptItemData.givenDate = this.giftCard2PurchaseDate;
            receiptItemData.valueBefore = this.giftCard2AmountBefore;
            receiptItemData.valueAfter = this.giftCard2AmountAfter;
            receiptData.items.push( receiptItemData );
        }
        if ( this.payments[2] > 0 ) {
            var receiptItemData = {
                sum: 0,
                paymentMethod: 1,
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '2020-01-01T00:00:00.000Z',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptItemData.sum = this.payments[2];
            receiptItemData.paymentMethod = 2;
            receiptData.items.push( receiptItemData );
        }
        if ( this.payments[3] > 0 ) {
            var receiptItemData = {
                sum: 0,
                paymentMethod: 1,
                giftCard1Type: 0,
                receiver: '',
                originator: '',
                givenDate: '2020-01-01T00:00:00.000Z',
                valueBefore: 0,
                valueAfter: 0
            };
            receiptItemData.sum = this.payments[3];
            receiptItemData.paymentMethod = 3;
            receiptData.items.push( receiptItemData );
        }

        this.shoppingCart.saveReceipt2( receiptData );
        this.shoppingCart.clearAll();
        this.clearPayments();
        this.update();
        document.getElementById( "receipt_view" ).style.visibility = "visible";

        setTimeout(() => {
            this.finishLoading();
            this.presentLoading( "Haetaan tuotteet..." );
            setTimeout(() => {
                this.productList.getProductInfo();
                this.finishLoading();
            }, 2000 );
            this.finishLoading();
        }, 2000 );

    }

    showCombinedPayment() {
        console.log( 'showCombinedPayment' );
        $( "#shopping_cart_area" ).hide();
        $( "#payment_data_area" ).show();
        this.toBePaid = this.totalSum;
        this.cardPaymentEnabled = false;
        this.cashPaymentEnabled = false;
        this.disableCombinedPaymentFields();
        this.validateCm();
    }

    cancelCombinedPayment() {
        console.log( 'cancelCombinedPayment' );
        $( "#payment_data_area" ).hide();
        $( "#shopping_cart_area" ).show();
        for ( var i = 0; i < this.payments.length; i++ ) {
            this.payments[i] = 0.0;
        }
    }

    // TODO: change so that cm1 value can be more that total sum
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
    }

    disableCombinedPaymentFields() {
        console.log( 'disableCombinedPaymentFields' );
        this.enableCm1Fields( false );
        this.enableCm2Fields( false );
    }

    /******************************************************************************************/
    /*** CM 1 ***/

    cm10Listener() {
        var selected = ( <HTMLInputElement>document.getElementById( "cm1" ) ).checked;
        //console.log( 'cm10Listener ' + selected );
        if ( selected ) {
            ( <HTMLInputElement>document.getElementById( "cm11" ) ).value = "20";
            this.enableCm1Fields( true );
            this.payments[0] = 20;
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
    /*** CM 2 ***/

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
        //console.log( 'cm2valid' );
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
                //                console.log( 'cm2valid: false ' + this.payments[1] + ', '
                //                    + this.giftCard2Receiver.length + ', '
                //                    + this.giftCard2Originator.length + ', '
                //                    + this.giftCard2PurchaseDate.length + ', '
                //                    + this.giftCard2AmountBefore + ', '
                //                    + this.giftCard2AmountAfter
                //                );
                return false;
            }

        } else {
            //console.log( 'cm2valid: true (cm2 not enabled)' );
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
    /*** CM 3 ***/

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
    /*** CM 4 ***/

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

    connectToPT() {
        console.log( 'connectToPT' );
        this.shoppingCart.connectToPT();
    }

    sendEmail() {
        console.log( 'sendEmail' );
        this.restProvider.sendRequest( 'send_email', [] );
    }

    confirmPayment() {
        console.log( 'confirmPayment' );
        this.presentLoading( "Talletetaan..." );
        this.receiptContent = Array.from( this.cartContent );
        this.receiptTotalSumAsString = this.totalSumAsString;
        this.shoppingCart.saveReceipt();
        this.shoppingCart.clearAll();
        this.update();
        document.getElementById( "receipt_view" ).style.visibility = "visible";
        this.cardPaymentEnabled = false;
        this.cashPaymentEnabled = false;
        this.giftCardPaymentEnabled = false;
        setTimeout(() => {
            this.finishLoading();
            this.presentLoading( "Haetaan tuotteet..." );
            setTimeout(() => {
                this.productList.getProductInfo();
                this.finishLoading();
            }, 2000 );
            this.finishLoading();
        }, 2000 );
    }

    cancelPurchase() {
        console.log( 'cancelPurchase' );
        document.getElementById( "receipt_view" ).style.visibility = "hidden";
        this.shoppingCart.clearAll();
        this.update();
    }

    checkIfCardPaymentEnabled() {
        //console.log('checkIfCardPaymentEnabled');
        return !this.cardPaymentEnabled;
    }

    checkIfCashPaymentEnabled() {
        //console.log('checkIfCashPaymentEnabled');
        return !this.cashPaymentEnabled;
    }

    checkIfGiftCartPaymentEnabled() {
        return !this.giftCardPaymentEnabled;
    }

    checkIfConfirmedPaymentEnabled() {
        return !this.confirmedPaymentEnabled;
    }

    update() {
        console.log( 'update' );
        this.productsInCart = this.shoppingCart.productsInCart;
        this.totalSum = this.shoppingCart.totalSum;
        this.totalSumAsString = this.shoppingCart.totalSum.toFixed( 2 );
        if ( this.totalSum > 0 ) {
            this.cardPaymentEnabled = true;
            this.cashPaymentEnabled = true;
            this.giftCardPaymentEnabled = true;
        } else {
            this.cardPaymentEnabled = false;
            this.cashPaymentEnabled = false;
            this.giftCardPaymentEnabled = false;
        }
    }

    setPaymentMethod( paymentMethod ) {
        var paymentMethods = [];
        paymentMethods[0] = paymentMethod;
        paymentMethods[1] = "";
        this.shoppingCart.setPaymentMethods( paymentMethods );
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
            this.restProvider.sendRequest( 'addchat', this.chat );
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
                this.presentLoading( "Haetaan..." );
                this.scrollToEnd();
                this.finishLoading();
            }, 1000 );
        }, ( err ) => {
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

    presentPromptPaymentCardInstructions() {
        let alert = this.alertController.create( {
            title: 'Syötä summa ' + this.totalSum + ' maksupäätteeseen',
            buttons: [
                {
                    text: 'Ok',
                    handler: () => {
                        console.log( 'Confirm card payment Ok' );
                        this.confirmPayment();
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
                            this.confirmPayment();
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
                        //this.showPrompt2(this.moneyBackAsFloat - this.totalSum);
                        this.confirmPayment();
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

    showCombinationPrompt() {
        const prompt = this.alertController.create( {
            title: 'Maksuyhdistelmä',
            message: "Anna tiedot summista eri maksutavoilla",
            inputs: [
                {
                    name: 'Money',
                    type: 'number',
                    placeholder: 'Käteinen'
                },
                {
                    name: 'Card',
                    type: 'number',
                    placeholder: 'Pankkikortti'
                },
                {
                    name: 'Giftcard',
                    type: 'number',
                    placeholder: 'Lahjakortti'
                },
                {
                    name: 'OriginOrganization',
                    type: 'string',
                    placeholder: 'Myynyt rauhanyhdistys'
                }
            ],
            buttons: [
                {
                    text: 'Oman ry:n lahjakortti 20€',
                    handler: data => {
                        console.log( 'Cancel clicked' );
                    }
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
                        //console.log('Saved clicked, data: ' + JSON.stringify(data.Money));
                        this.confirmPayment();
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
}
