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
    ownPurchaseData = [];

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
        var ownPurchaseCount = 0;

        var giftCard1PurchaseValue = 0.0;
        var giftCard2PurchaseValue = 0.0;
        var cashPurchaseValue = 0.0;
        var cardPurchaseValue = 0.0;
        var ownPurchaseValue = 0.0;

        var ownPurchaseTable = "";
        var ownPurchaseRows = "";

        this.ownPurchaseData.splice( 0, this.ownPurchaseData.length );

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
            } else if ( purchases[i].paymentMethod == 4 ) {
                var receiptData = {
                    handedTo: '',
                    committee: '',
                    receiver: '',
                    totalSum: ''
                }
                receiptData.handedTo = purchases[i].handedTo;
                receiptData.committee = purchases[i].committee;
                receiptData.receiver = purchases[i].receiver;
                receiptData.totalSum = purchases[i].totalSum.toFixed( 2 );
                this.ownPurchaseData.push( receiptData );
                ownPurchaseCount++;
                ownPurchaseValue += purchases[i].totalSum;
            }
        }

        var currentDate = new Date().toLocaleDateString( 'fi-FI' );
        var currentTime = new Date().toLocaleTimeString( 'fi-FI' );
        var currentDateTime = currentDate.toString() + "   " + currentTime;
        console.log( 'current date: ' + currentDateTime );

        var cardTrCount = cardTransactionCount.toString();
        var cardTrValue = cardPurchaseValue.toFixed( 2 );
        var cashTrCount = cashTransactionCount.toString();
        var cashTrValue = cashPurchaseValue.toFixed( 2 );
        var giftCartTrCount = giftCard1TransactionCount.toString();
        var giftCartTrValue = giftCard1PurchaseValue.toFixed( 2 );
        var ownPurchaseTrValue = ownPurchaseValue.toFixed( 2 );

        if ( this.ownPurchaseData.length > 0 ) {
            for ( var i = 0; i < this.ownPurchaseData.length; i++ ) {
                ownPurchaseRows += "<tr><td style=\"padding:0px 10px 0px 10px\">" + this.ownPurchaseData[i].handedTo + "</td>";
                ownPurchaseRows += "<td style=\"padding:0px 10px 0px 10px\">" + this.ownPurchaseData[i].committee + "</td>";
                ownPurchaseRows += "<td style=\"padding:0px 10px 0px 10px\">" + this.ownPurchaseData[i].receiver + "</td>",
                    ownPurchaseRows += "<td style=\"padding:0px 10px 0px 10px\">" + this.ownPurchaseData[i].totalSum + "</td>",
                    "</tr>";
            }

            ownPurchaseTable = [
                "<h5>Ry:n omien ottojen erittely</h5>",
                "<table border=\"1\" bordercolor=\"#eeeeee\"><tr>",
                "<th align=\"left\" style=\"padding:0px 10px 0px 10px\">Kenelle tuote luovutettu</th>",
                "<th align=\"left\" style=\"padding:0px 10px 0px 10px\">Toimikunta</th>",
                "<th align=\"left\" style=\"padding:0px 10px 0px 10px\">Tuotteen saaja</th>",
                "<th align=\"left\" style=\"padding:0px 10px 0px 10px\">Arvo euroina</th>",
                "</tr>",
                ownPurchaseRows,
                "</table>"
            ].join( '' );
        }

        var str = [
            "<html>",
            "<body>",
            "<h2>Tilitysraportti</h2><small>",
            currentDateTime,
            "</small><hr>",
            "<h3>Kassatapahtumat</h3>",
            "<table>",
            "<tr><th align=\"left\">Maksuväline</th>",
            "<th align=\"left\" style=\"padding:0px 0px 0px 10px\">",
            "Kpl</th><th align=\"left\" style=\"padding:0px 0px 0px 10px\">Arvo euroina</th></tr>",

            "<td>Maksukortti</td><td style=\"padding:0px 0px 0px 10px\">",
            cardTrCount,
            "</td><td style=\"padding:0px 0px 0px 10px\">",
            cardTrValue,
            "</td></tr><tr>",

            "<td>Käteinen</td><td style=\"padding:0px 0px 0px 10px\">",
            cashTrCount,
            "</td><td style=\"padding:0px 0px 0px 10px\">",
            cashTrValue,
            "</td></tr><tr><td>",

            "Ry:n lahjakortti</td><td style=\"padding:0px 0px 0px 10px\">",
            giftCartTrCount,
            "</td><td style=\"padding:0px 0px 0px 10px\">",
            giftCartTrValue,
            "</td></tr><tr><td>",

            "Ry:n omat otot</td><td style=\"padding:0px 0px 0px 10px\">",
            ownPurchaseCount,
            "</td><td style=\"padding:0px 0px 0px 10px\">",
            ownPurchaseTrValue,
            "</td></tr></table>",

            ownPurchaseTable,
            "<p>Kassa: ",
            cashier,
            "</p>",
            "<p><i>Maksupäätekuitit on arkistoitu myyntipisteellä.</i></p>",
            "<p><i>Käteistuotto tilitetään jokaisen kuukauden viimeisenä sunnuntaina.</i></p>",
            "</body>",
            "</html>"

        ].join( '' );

        console.log( str );
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
