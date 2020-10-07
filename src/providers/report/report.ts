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

    setTestUser( isTestUser ) {
        if ( !isTestUser ) {
            this.transactionReportAddress = "lahdenry.laskut@gmail.com";
            //this.transactionReportAddress = "mikko.m.suni@gmail.com";
        } else {
            this.transactionReportAddress = "Ei määritelty";
        }
    }

    getReportingAddress() {
        return this.transactionReportAddress;
    }

    makeTransactionReportMessage( purchases, cashier ) {

        var giftCard1TransactionCount = 0; // RY
        //var giftCard2TransactionCount = 0; // SRK - not included to reports for the time being
        var cashTransactionCount = 0;
        var cardTransactionCount = 0;
        var mobilePayTransactionCount = 0;
        var ownPurchaseCount = 0;
        var invoiceTranscationCount = 0;

        var giftCard1PurchaseValue = 0.0; // RY
        //var giftCard2PurchaseValue = 0.0; // SRK - not included to reports for the time being
        var cashPurchaseValue = 0.0;
        var cardPurchaseValue = 0.0;
        var mobilePayPurchaseValue = 0.0;
        var ownPurchaseValue = 0.0;
        var invoiceValue = 0.0;

        var ownPurchaseTable = "";
        var ownPurchaseRows = "";
        var ownPurchaseData = [];

        var giftCard1Table = "";
        var giftCard1Rows = "";
        var giftCard1Data = [];

        for ( var i = 0; i < purchases.length; i++ ) {
            if ( purchases[i].paymentMethod == 0 ) {
                var giftCardData = { giftCardType: '', receiver: '', value: '' };
                giftCardData.giftCardType = purchases[i].giftCard1Type === 0 ? "Vauva" : "Merkkipäivä";
                giftCardData.receiver = purchases[i].receiver;
                giftCardData.value = purchases[i].totalSum.toFixed( 2 );
                giftCard1Data.push( giftCardData );
                giftCard1TransactionCount++;
                giftCard1PurchaseValue += purchases[i].totalSum;
                //} else if ( purchases[i].paymentMethod == 1 ) {
                //    giftCard2TransactionCount++;
                //    giftCard2PurchaseValue += purchases[i].totalSum;
            } else if ( purchases[i].paymentMethod == 2 ) {
                cashTransactionCount++;
                cashPurchaseValue += purchases[i].totalSum;
            } else if ( purchases[i].paymentMethod == 3 ) {
                cardTransactionCount++;
                cardPurchaseValue += purchases[i].totalSum;
            } else if ( purchases[i].paymentMethod == 4 ) {
                mobilePayTransactionCount++;
                mobilePayPurchaseValue += purchases[i].totalSum;
            } else if ( purchases[i].paymentMethod == 5 ) {
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
                ownPurchaseData.push( receiptData );
                ownPurchaseCount++;
                ownPurchaseValue += purchases[i].totalSum;
            } else if ( purchases[i].paymentMethod == 6 ) {
                invoiceTranscationCount++;
                invoiceValue += purchases[i].totalSum;
            }
        }

        var currentDate = new Date().toLocaleDateString( 'fi-FI' );
        var currentTime = new Date().toLocaleTimeString( 'fi-FI' );
        var currentDateTime = currentDate.toString() + "   " + currentTime;

        var cardTrCount = cardTransactionCount.toString();
        var cardTrValue = cardPurchaseValue.toFixed( 2 );
        var mobilePayTrCount = mobilePayTransactionCount.toString();
        var mobilePayTrValue = mobilePayPurchaseValue.toFixed( 2 );
        var cashTrCount = cashTransactionCount.toString();
        var cashTrValue = cashPurchaseValue.toFixed( 2 );
        var giftCartTrCount = giftCard1TransactionCount.toString();
        var giftCartTrValue = giftCard1PurchaseValue.toFixed( 2 );
        var ownPurchaseTrValue = ownPurchaseValue.toFixed( 2 );
        var invoiceTrCount = invoiceTranscationCount.toString();
        var invoiceTrValue = invoiceValue.toFixed( 2 );

        if ( giftCard1Data.length > 0 ) {
            for ( var i = 0; i < giftCard1Data.length; i++ ) {
                giftCard1Rows += "<tr><td style=\"padding:0px 10px 0px 10px\">" + giftCard1Data[i].receiver + "</td>";
                giftCard1Rows += "<td style=\"padding:0px 10px 0px 10px\">" + giftCard1Data[i].giftCardType + "</td>";
                giftCard1Rows += "<td style=\"padding:0px 10px 0px 10px\">" + giftCard1Data[i].value + "</td>",
                    "</tr>";
            }

            giftCard1Table = [
                "<h5>Ry:n lahjakorttien erittely</h5>",
                "<table border=\"1\" bordercolor=\"#eeeeee\"><tr>",
                "<th align=\"left\" style=\"padding:0px 10px 0px 10px\">Saaja</th>",
                "<th align=\"left\" style=\"padding:0px 10px 0px 10px\">Laji</th>",
                "<th align=\"left\" style=\"padding:0px 10px 0px 10px\">Arvo euroina</th>",
                "</tr>",
                giftCard1Rows,
                "</table>"
            ].join( '' );
        }

        if ( ownPurchaseData.length > 0 ) {
            for ( var i = 0; i < ownPurchaseData.length; i++ ) {
                ownPurchaseRows += "<tr><td style=\"padding:0px 10px 0px 10px\">" + ownPurchaseData[i].handedTo + "</td>";
                ownPurchaseRows += "<td style=\"padding:0px 10px 0px 10px\">" + ownPurchaseData[i].committee + "</td>";
                ownPurchaseRows += "<td style=\"padding:0px 10px 0px 10px\">" + ownPurchaseData[i].receiver + "</td>",
                    ownPurchaseRows += "<td style=\"padding:0px 10px 0px 10px\">" + ownPurchaseData[i].totalSum + "</td>",
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

            "<td>MobilePay</td><td style=\"padding:0px 0px 0px 10px\">",
            mobilePayTrCount,
            "</td><td style=\"padding:0px 0px 0px 10px\">",
            mobilePayTrValue,
            "</td></tr><tr>",

            "<td>Käteinen</td><td style=\"padding:0px 0px 0px 10px\">",
            cashTrCount,
            "</td><td style=\"padding:0px 0px 0px 10px\">",
            cashTrValue,
            "</td></tr><tr>",

            "<td>Lasku</td><td style=\"padding:0px 0px 0px 10px\">",
            invoiceTrCount,
            "</td><td style=\"padding:0px 0px 0px 10px\">",
            invoiceTrValue,
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
            giftCard1Table,
            "<p>Kassa: ",
            cashier,
            "</p>",
            "<p><i>Maksupäätekuitit on arkistoitu myyntipisteellä.</i></p>",
            "<p><i>Käteistuotto tilitetään jokaisen kuukauden viimeisenä sunnuntaina.</i></p>",
            "</body>",
            "</html>"

        ].join( '' );

        return str;
    }

    makeToBeOrderedReportMessage( orders ) {

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

        return str;
    }

    sendReports() {
        this.restProvider.sendRequest( 'not_reported_receipts', [] ).then(( result: any ) => {
            var receipts = JSON.parse( result.result );
            var cashier = "";
            this.reportMessage.subject = "Julkaisumyyntiraportti";
            if ( receipts.length > 0 ) {
                cashier = receipts[receipts.length - 1].cashier;
            }
            this.reportMessage.content = this.makeTransactionReportMessage( receipts, cashier );
            this.reportMessage.recipient = this.transactionReportAddress;
            this.reportMessage.format = "text/html";
            this.restProvider.sendRequest( 'send_email', this.reportMessage ).then(( result: any ) => {
                this.restProvider.sendRequest( 'set_as_reported', receipts ).then(( result: any ) => {
                }, ( err ) => {
                    console.log( err );
                } );
            }, ( err ) => {
                console.log( err );
            } );
        }, ( err ) => {
            console.log( err );
        } );
    }

    sendProductInfoDbDumb() {
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
        this.dbDump.dbentry = dbClass;
        this.restProvider.sendRequest( 'db_entries', this.dbDump ).then(( result: any ) => {
            var entries = JSON.parse( result.result );
            this.reportMessage.subject = dbClass;
            this.reportMessage.content = JSON.stringify( entries );
            this.reportMessage.recipient = this.adminEmail;
            this.reportMessage.format = "text/plain";
            this.restProvider.sendRequest( 'send_email', this.reportMessage ).then(( result: any ) => {
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

    makeReceipt( receiptData ) {

        var currentDate = new Date().toLocaleDateString( 'fi-FI' );
        var currentTime = new Date().toLocaleTimeString( 'fi-FI' );
        var currentDateTime = currentDate.toString() + "   " + currentTime;
        var receiptRows = [];
        var cardPaymentIncluded = false;

        // caption
        var headerStr = [
            "<html><body>",
            "<h2>Julkaisumyyntikuitti",
            " (",
            receiptData.receiptNr,
            ")",
            "</h2><small>",
            currentDateTime,
            "</small><hr>",
            "<h3>Lahden seudun rauhanyhdistys r.y.</h3>",
            "<table><tr>",
            "<th align=\"left\">Tuote</th>",
            "<th align=\"left\" style=\"padding:0px 0px 0px 10px\">Hinta</th>",
            "<th align=\"left\" style=\"padding:0px 0px 0px 10px\">Määrä</th>",
            "<th align=\"left\" style=\"padding:0px 0px 0px 10px\">Yhteensä</th>",
            "</tr>"
        ].join( '' );


        // products
        for ( var i = 0; i < receiptData.purchasedItems.length; i++ ) {
            receiptRows.push( "<tr><td>" );
            receiptRows.push( receiptData.purchasedItems[i].productName );
            receiptRows.push( "</td><td style=\"padding:0px 0px 0px 10px\">" );
            receiptRows.push( receiptData.purchasedItems[i].priceAsString );
            receiptRows.push( "</td><td style=\"padding:0px 0px 0px 10px\">" );
            receiptRows.push( receiptData.purchasedItems[i].quantity );
            receiptRows.push( " kpl</td><td style=\"padding:0px 0px 0px 10px\">" );
            receiptRows.push( receiptData.purchasedItems[i].totalAsString );
            receiptRows.push( "</td style=\"padding:0px 0px 0px 10px\"></tr>" );
        }
        receiptRows.push( "<tr><td></td><td></td><td></td><th>" );
        receiptRows.push( receiptData.totalSum );
        receiptRows.push( " €</th></tr></table><br>" );

        // payment methods
        receiptRows.push( "<table><tr>" );
        receiptRows.push( "<th align=\"left\">Maksutavat</th>" );
        receiptRows.push( "<th align=\"left\" style=\"padding:0px 0px 0px 10px\">Summa</th>" );
        for ( var i = 0; i < receiptData.receiptPaymentInfo.length; i++ ) {
            receiptRows.push( "<tr><td>" );
            receiptRows.push( receiptData.receiptPaymentInfo[i].paymentMethodDescription );
            receiptRows.push( "</td><td style=\"padding:0px 0px 0px 10px\">" );
            receiptRows.push( receiptData.receiptPaymentInfo[i].sumAsString );
            receiptRows.push( "</td style=\"padding:0px 0px 0px 10px\"></tr>" );
            if ( receiptData.receiptPaymentInfo[i].paymentMethod == 3 ) {
                cardPaymentIncluded = true;
            }
        }
        if ( cardPaymentIncluded ) {
            receiptRows.push( "<tr><td style = 'padding: 1px 5px 1px 5px;font-size: 70%;font-family: Lucida Console;'>Maksukortti</td></tr>" );
            receiptRows.push( "<tr><td style = 'padding: 1px 5px 1px 5px;font-size: 70%;font-family: Lucida Console;white-space:pre;'>" );
            receiptRows.push( receiptData.ptCustomerText );
        }
        receiptRows.push( "</td></tr></table></body></html>" );

        return headerStr + receiptRows.join( '' );
    }

    sendReceipt( receiptData ) {
        console.log( JSON.stringify( receiptData ) );
        var receiptStr = this.makeReceipt( receiptData );
        console.log( receiptStr );

        this.reportMessage.subject = "Julkaisumyyntikuitti";
        this.reportMessage.content = receiptStr;
        this.reportMessage.recipient = receiptData.recipient;
        this.reportMessage.format = "text/html";

        this.restProvider.sendRequest( 'send_email', this.reportMessage ).then(( result: any ) => {
            console.log( 'receipt mail sent' );
        }, ( err ) => {
            console.log( err );
        } );
    }
}
