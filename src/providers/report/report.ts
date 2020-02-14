import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProductList } from '../../providers/productlist/productlist';
import { RestProvider } from '../../providers/rest/rest';

/*
  Generated class for the ReportProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ReportProvider {

    reportMessage = { recipient: '', subject: '', content: '', format: '' };
    dbDump = { dbentry: '' };

    transactionReportAddress = "lahdenry.laskut@gmail.com";
    //transactionReportAddress = "mikko.m.suni@gmail.com";
    productsToBeOrderedReportAddress = "mikko.m.suni@gmail.com";
    adminEmail = "mikko.m.suni@gmail.com";

    testMode: boolean = false;

    constructor( public http: HttpClient, public productList: ProductList, public restProvider: RestProvider ) {
        console.log( 'Hello ReportProvider Provider' );
    }

    getTestMode() {
        return this.testMode;
    }

    setTestMode( testModeActivated ) {
        if ( testModeActivated ) {
            this.transactionReportAddress = "mikko.m.suni@gmail.com";
        } else {
            this.transactionReportAddress = "lahdenry.laskut@gmail.com";
        }
        this.testMode = testModeActivated;
    }

    getReportingAddress() {
        return this.transactionReportAddress;
    }

    makeTransactionReportMessage( purchases, cashier ) {

        console.log( 'purchases: ' + JSON.stringify( purchases ) );

        var giftCard1TransactionCount = 0;
        var giftCard2TransactionCount = 0;
        var cashTransactionCount = 0;
        var cardTransactionCount = 0;

        var giftCard1PurchaseValue = 0.0;
        var giftCard2PurchaseValue = 0.0;
        var cashPurchaseValue = 0.0;
        var cardPurchaseValue = 0.0;

        for ( var i = 0; i < purchases.length; i++ ) {
            if ( purchases[i].paymentMethod == 0 ) {
                giftCard1TransactionCount++;
                giftCard1PurchaseValue += purchases[i].totalSum;
            } else if ( purchases[i].paymentMethod == 1 ) {
                giftCard2TransactionCount++;
                giftCard2PurchaseValue += purchases[i].totalSum;
            } else if ( purchases[i].paymentMethod == 2 ) {
                cashTransactionCount++;
                cashPurchaseValue += purchases[i].totalSum;
            } else if ( purchases[i].paymentMethod == 3 ) {
                cardTransactionCount++;
                cardPurchaseValue += purchases[i].totalSum;
            }
        }

        var currentDate = new Date().toLocaleDateString( 'fi-FI' );
        var currentTime = new Date().toLocaleTimeString( 'fi-FI' );
        var currentDateTime = currentDate.toString() + "   " + currentTime;
        console.log( 'current date: ' + currentDateTime );

        //        var str = "Tilitysraportti " + currentDate.toString();
        //
        //        str += '\n\nKassatapahtumat\n';
        //        str += '--------------------------------------------------------------\n';
        //
        //        str += 'Maksukorttiostojen määrä: ';
        //        str += '\t\t\t';
        //        str += cardTransactionCount.toString();
        //        str += ' kpl, \t arvo: ';
        //        str += cardPurchaseValue.toFixed( 2 );
        //        str += ' euroa \n';
        //
        //        str += 'Käteisostojen määrä: ';
        //        str += '\t\t\t\t\t';
        //        str += cashTransactionCount.toString();
        //        str += ' kpl, \t arvo: ';
        //        str += cashPurchaseValue.toFixed( 2 );
        //        str += ' euroa \n';
        //
        //        str += 'Lahden ry:n lahjakorttiostojen määrä: ';
        //        str += '\t';
        //        str += giftCard1TransactionCount.toString();
        //        str += ' kpl, \t arvo: ';
        //        str += giftCard1PurchaseValue.toFixed( 2 );
        //        str += ' euroa';
        //
        //        str += '\n\nViesti on lähetetty julkaisumyynnin kassajärjestelmästä automaattisesti.'
        //
        //        console.log( '*** report: ' + str );
        //
        //        return str;

        var cardTrCount = cardTransactionCount.toString();
        var cardTrValue = cardPurchaseValue.toFixed( 2 );
        var cashTrCount = cashTransactionCount.toString();
        var cashTrValue = cashPurchaseValue.toFixed( 2 );
        var giftCartTrCount = giftCard1TransactionCount.toString();
        var giftCartTrValue = giftCard1PurchaseValue.toFixed( 2 );

        var str = [
            "<html>",
            "<body>",
            "<h2>Tilitysraportti</h2><small>",
            currentDateTime,
            "</small><hr>",
            "<h4>Kassatapahtumat</h4>",
            "<table>",
            "<tr><th align=\"left\">Maksuväline</th>",
            "<th align=\"left\" style=\"padding:0px 0px 0px 10px\">",
            "Kpl</th><th align=\"left\" style=\"padding:0px 0px 0px 10px\">Arvo euroina</th></tr>",
            "<td>Maksukorttiostot:</td><td style=\"padding:0px 0px 0px 10px\">",
            cardTrCount,
            "</td><td style=\"padding:0px 0px 0px 10px\">",
            cardTrValue,
            "</td></tr><tr>",
            "<td>Käteisostot:</td><td style=\"padding:0px 0px 0px 10px\">",
            cashTrCount,
            "</td><td style=\"padding:0px 0px 0px 10px\">",
            cashTrValue,
            "</td>",
            "</tr><tr><td>",
            "Lahjakorttiostot ry:n lahjakortilla:</td><td style=\"padding:0px 0px 0px 10px\">",
            giftCartTrCount,
            "</td><td style=\"padding:0px 0px 0px 10px\">",
            giftCartTrValue,
            "</td>",
            "</tr>",
            "</table>",
            "<p>Kassa: ",
            cashier,
            "</p>",
            "<p><i>Maksupäätekuitit on arkistoitu myyntipisteellä.</i></p>",
            "<p><i>Käteistuotto tilitetään jokaisen kuukauden viimeisenä sunnuntaina.</i></p>",
            "</body>",
            "</html>"

        ].join( '' );


        //https://www.w3schools.com/html/tryit.asp?filename=tryhtml_basic
        //https://www.w3schools.com/css/tryit.asp?filename=trycss_table_striped

        return str;
    }

    makeToBeOrderedReportMessage( orders ) {

        console.log( 'orders: ' + JSON.stringify( orders ) );

        var str = "";

        str += '\n\Loppuneet tai loppumassa olevat tuotteet\n';
        str += '--------------------------------------------------------------\n';

        for ( var i = 0; i < orders.length; i++ ) {
            str += orders[i].productName;
            str += '\t\t\t\t\t'
            str += orders[i].amountInStock;
            str += ' kappaletta\n'
        }
        str += '\n\nViesti on lähetetty julkaisumyynnin kassajärjestelmästä automaattisesti.'

        console.log( '*** report: ' + str );

        return str;
    }

    sendReports() {
        this.restProvider.sendRequest( 'receipts', [] ).then(( result: any ) => {
            var receipts = JSON.parse( result.result );
            var cashier = "";
            console.log( 'receipts: ' + JSON.stringify( receipts ) );
            this.reportMessage.subject = "Julkaisumyyntiraportti";
            if ( receipts.length > 0 ) {
                cashier = receipts[receipts.length - 1].cashier;
            }
            this.reportMessage.content = this.makeTransactionReportMessage( receipts, cashier );
            this.reportMessage.recipient = this.transactionReportAddress;
            this.reportMessage.format = "text/html";
            //this.reportMessage.format = "text/plain";
            this.restProvider.sendRequest( 'send_email', this.reportMessage ).then(( result: any ) => {
                console.log( 'report mail sent' );
                //this.sendToBeOrderedReport();
            }, ( err ) => {
                console.log( err );
            } );
        }, ( err ) => {
            console.log( err );
        } );
    }

    sendProductInfoDbDumb() {
        console.log( '>> sendProductInfoDbDumb ' );
        this.reportMessage.subject = "productInfo";
        this.reportMessage.content = JSON.stringify( this.productList.products() );
        this.reportMessage.recipient = this.adminEmail;
        this.reportMessage.format = "text/plain";
        this.restProvider.sendRequest( 'send_email', this.reportMessage ).then(( result: any ) => {
            console.log( 'productInfo dump mail sent' );
        }, ( err ) => {
            console.log( err );
        } );
        //console.log( '>>' + this.reportMessage.content );
    }

    senddBClassDumb( dbClass ) {
        console.log( '>> senddBClassDumb: ' + dbClass );
        this.dbDump.dbentry = dbClass;
        this.restProvider.sendRequest( 'db_entries', this.dbDump ).then(( result: any ) => {
            var entries = JSON.parse( result.result );
            console.log( '>>' + JSON.stringify( entries ) );
            this.reportMessage.subject = dbClass;
            this.reportMessage.content = JSON.stringify( entries );
            this.reportMessage.recipient = this.adminEmail;
            this.reportMessage.format = "text/plain";
            this.restProvider.sendRequest( 'send_email', this.reportMessage ).then(( result: any ) => {
                console.log( dbClass + ' dump mail sent' );
            }, ( err ) => {
                console.log( err );
            } );
        }, ( err ) => {
            console.log( err );
        } );
    }

    sendToBeOrderedReport() {
        var productsToBeOrdered = this.productList.getProductsBelowCount( 2 );

        this.reportMessage.content = this.makeToBeOrderedReportMessage( productsToBeOrdered );
        this.reportMessage.recipient = this.productsToBeOrderedReportAddress;
        this.restProvider.sendRequest( 'send_email', this.reportMessage ).then(( result: any ) => {
            console.log( 'order info mail sent' );
        }, ( err ) => {
            console.log( err );
        } );
    }
}
