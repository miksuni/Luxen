import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProductList } from '../../providers/productlist/productlist';
import { ShoppingcartProvider } from '../../providers/shoppingcart/shoppingcart';
import { RestProvider } from '../../providers/rest/rest';
import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

/**
 * Generated class for the ShopPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-shop',
  templateUrl: 'shop.html',
})
export class ShopPage {
    
  productNumberInitials: string = "";
  productNameInitials: string = "";

  cartContent = [];
  receiptContent = [];
  searchResult: any;
  
  sites = [{id:'Lahti'}];
  cashiers: any;
  orderList = { products:[] };
  productInfo = { objectId:'', ISBN:'', productName:'', price:'', amountInStock:'', productCode:'', availableFromPublisher:'' };
  productsInCart = 0;
  totalSum: number = 0;
  totalSumAsString: string = "";
  receiptTotalSumAsString: string = "";

  givenAmount = 0;
  cashBack = 0;
  
  moneyGiven: number = 0.0;

  cardPaymentEnabled: boolean = false;
  cashPaymentEnabled: boolean = false;
  
  cashier = "";
  
  loadingIndicator: any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public productList: ProductList,
              private shoppingCart: ShoppingcartProvider,
              public restProvider: RestProvider,
              private alertController: AlertController,
              public loadingCtrl: LoadingController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShopPage');
    document.getElementById("receipt_view").style.visibility = "hidden";
    this.productList.getProductInfo();
    this.shoppingCart.clearAll();
    this.cartContent = this.shoppingCart.getProducts();
    this.getCashiers();
    this.update();
  }
  
  getCashiers() {
      console.log('>> home.getCashiers');
      this.restProvider.cashiers("").then((result:any) => {
          console.log('>> result received');
          this.cashiers = JSON.parse(result.result);
          console.log('cashiers: ' + JSON.stringify(this.cashiers));
      }, (err) => {
          console.log(err);
      });
  }
  
  // Works only wiht ion-select
  //onCashierChange($event){
  //    console.log('>> onCashierChange: ' + $event);
  //    this.cashier = $event;
  //    this.shoppingCart.setCashier(this.cashier);
  //}
  
  onLogout() {
      console.log('>> shop.onLogout');
      if (this.shoppingCart.hasContent()) {
          this.presentPromptItemsInShoppingCart();
      } else {
          var e = document.getElementById("current_cashier") as HTMLSelectElement;
          e.selectedIndex = 0;
      }
      this.orderList.products = this.productList.getProductsBelowCount(2);
      if (this.orderList.products.length > 0) {
          console.log('>> number of items to be ordered: ' + this.orderList.products.length);
          this.restProvider.sendRequest('send_email', this.orderList);
      }
  }
  
  onProductInputClicked() {
      console.log('>> shop.onProductInputClicked:');
      var e = document.getElementById("current_cashier") as HTMLSelectElement;
      //var value = e.options[e.selectedIndex].value;
      this.cashier = e.options[e.selectedIndex].text;
      console.log("cashier: " + e.options[e.selectedIndex].text);
      if (this.cashier.length == 0) {
          this.presentPromptSelectCashier();
      }  
  }
  
  onProductNumberUpdated() {
      console.log('>> shop.onProductNumberUpdated: ' + this.productNumberInitials);
      document.getElementById("receipt_view").style.visibility = "hidden";
      if (this.productNumberInitials.length > 0) {
          var found = this.productList.getProductProgressivelyByNumber(this.productNumberInitials);
          this.searchResult = found;
          console.log('>> found: ' + found.length);
          console.log('>> json: ' + JSON.stringify(found));
      }
  }

  onProductNameUpdated() {
      console.log('>> shop.onProductNameUpdated: ' + this.productNameInitials);
      document.getElementById("receipt_view").style.visibility = "hidden";
      var found = this.productList.getProductByName(this.productNameInitials);
      this.searchResult = found;
      console.log('>> found: ' + found.length);
      console.log('>> json: ' + JSON.stringify(found));
  }
  
  onProductSelected(productName, index) {
      console.log('>> shop.onProductSelected: ' + productName + ' index: ' + index);
      this.checkConditions(this.searchResult[index]);
      this.searchResult.splice(0,this.searchResult.length)
    }

  addToShoppingCart(productInfo) {
      console.log('>> shop.addToShoppingCart');
      if (productInfo.amountInStock < 1) {
          this.presentPromptNoItemsInStock(productInfo);
      } else {
          this.shoppingCart.addProduct(productInfo);
          this.update();
      }
  }
  
  checkConditions(productInfo) {
      console.log('>> shop.checkConditions: ' + JSON.stringify(productInfo));
      var e = document.getElementById("current_cashier") as HTMLSelectElement;
      //var value = e.options[e.selectedIndex].value;
      this.cashier = e.options[e.selectedIndex].text;
      if (this.cashier.length == 0) {
          this.presentPromptSelectCashier();
      }  else {
          this.addToShoppingCart(productInfo);
      }
  }

  onGivenAmountUpdated() {
    console.log('>> shop.onGivenAmountUpdated');
    this.cashBack = this.givenAmount - this.totalSum;
  }

  removeProduct(productName, i) {
    console.log('removeFromCart: ' + productName + ", index: " + i);
    this.shoppingCart.removeProduct(i);
    this.update();
  }

  increase(item, i) {
      console.log('increaseItem: ' + item.productName + ", index: " + i);
      if (item.quantity >= item.amountInStock) {
          this.presentPromptNotEnoughInStock(i, item.amountInStock);
      } else {
          this.shoppingCart.increase(i);
          this.update();
      }
  }
  
  decrease(item, i) {
      console.log('decreaseItem: ' + item.productName + ", index: " + i);
      if (item.quantity < 2) {
          this.presentPromptRemoveProduct(i);
      } else {
          this.shoppingCart.decrease(i);
          this.update();
      }
  }
  
  cashPayment() {
      console.log('cashPayment');
      this.shoppingCart.setCashier(this.cashier);
      this.showPrompt();
      console.log('Saved clicked, data: ' + this.moneyGiven.toString());
      this.setPaymentMethod("Käteinen");
  }
  
  cardPayment() {
    console.log('cardPayment');
    this.shoppingCart.setCashier(this.cashier);
    this.setPaymentMethod("Maksukortti");
    this.presentPromptPaymentCardInstructions();
  }

  connectToPT() {
    console.log('connectToPT');
    this.shoppingCart.connectToPT();
  }
  
  sendEmail() {
      console.log('sendEmail');
      this.restProvider.sendRequest('send_email',[]);
  }

  confirmPayment() {
    console.log('confirmPayment');
    this.presentLoading("Talletetaan...");
    this.receiptContent = Array.from(this.cartContent);
    this.receiptTotalSumAsString = this.totalSumAsString;
    this.shoppingCart.saveReceipt();
    this.shoppingCart.clearAll();
    this.update();
    document.getElementById("receipt_view").style.visibility = "visible";
    this.cardPaymentEnabled = false;
    this.cashPaymentEnabled = false;
    setTimeout( () => {
        this.finishLoading();
        this.presentLoading("Haetaan tuotteet...");
        setTimeout( () => {
            this.productList.getProductInfo();
            this.finishLoading();
        }, 2000);
        this.finishLoading();
    }, 2000);
  }

  cancelPurchase() {
    console.log('cancelPurchase');
    document.getElementById("receipt_view").style.visibility = "hidden";
    this.shoppingCart.clearAll();
    this.update();
  }

  checkIfCardPaymentEnabled() {
    //console.log('checkIfCardPaymentEnabled');
    return !this.cardPaymentEnabled;
  }

  checkIfCashPaymentEnabled() {
    //console.log('checkIfCashPaymentEnabled');
    return !this.cardPaymentEnabled;
  }

  update() {
    console.log('update');
    this.productsInCart = this.shoppingCart.productsInCart;
    this.totalSum = this.shoppingCart.totalSum;
    this.totalSumAsString = this.shoppingCart.totalSum.toFixed(2);
    if (this.totalSum > 0) {
      this.cardPaymentEnabled = true;
      this.cashPaymentEnabled = true;
    } else {
      this.cardPaymentEnabled = false;
      this.cashPaymentEnabled = false;
    }
  }
  
  setPaymentMethod(paymentMethod) {
      var paymentMethods = [];
      paymentMethods[0] = paymentMethod;
      paymentMethods[1] = "";
      this.shoppingCart.setPaymentMethods(paymentMethods);
  }
  
  presentPromptSelectCashier() {
      let alert = this.alertController.create({
        title: 'Aseta kassa ensin',
        buttons: [
          {
            text: 'Ok',
            handler: () => {
              console.log('Confirm Ok');
            }
          }
        ]
      });
      alert.present();
    }
  
  presentPromptNotEnoughInStock(i, amountInStock) {
      let alert = this.alertController.create({
          title: 'Tarkista saatavuus',
          message: "Varastosaldon mukaan tuotetta on vain " + amountInStock + " kpl",
          buttons: [
            {
              text: 'Vahvista osto',
              handler: () => {
                console.log('Confirm Ok');
                this.shoppingCart.increase(i);
              }
            },
            {
                text: 'Peruuta',
                    handler: () => {
                        console.log('Cancel');
                    }
             }
          ]
      });
      alert.present();
  }
  
  presentPromptRemoveProduct(i) {
      let alert = this.alertController.create({
        title: 'Poistetaanko tuote ostoskorista?',
        buttons: [
          {
            text: 'Ok',
            handler: () => {
              console.log('Confirm Ok');
              this.shoppingCart.decrease(i);
            }
          },
          {
              text: 'Peruuta',
              handler: () => {
                console.log('Cancel');
              }
            }
        ]
      });
      alert.present();
    }
  
  presentPromptPaymentCardInstructions() {
      let alert = this.alertController.create({
        title: 'Syötä summa ' + this.totalSum + ' maksupäätteeseen',
        buttons: [
          {
            text: 'Ok',
            handler: () => {
              console.log('Confirm card payment Ok');
              this.confirmPayment();
            }
          }
        ]
      });
      alert.present();
    }
  
  showPrompt() {
      const prompt = this.alertController.create({
        title: 'Käteinen',
        message: "Asiakkaan antama summa",
        inputs: [
          {
            name: 'Money',
            type: 'number',
            //placeholder: ''
          }
        ],
        buttons: [
          {
            text: 'Kirjoitettu summa',
            handler: data => {
              this.moneyGiven = data.Money;
              console.log('Saved clicked, data: ' + this.moneyGiven.toString());
              this.showPrompt2(this.moneyGiven - this.totalSum);
            },
          },
          {
              text: '10 e',
              handler: data => {
                this.moneyGiven = data.Money;
                console.log('Saved clicked, data: ' + this.moneyGiven.toString());
                this.showPrompt2(10 - this.totalSum);
              },
           },
           {
               text: '20 e',
               handler: data => {
                 this.moneyGiven = data.Money;
                 console.log('Saved clicked, data: ' + this.moneyGiven.toString());
                 this.showPrompt2(20 - this.totalSum);
               },
            },
            {
                text: '50 e',
                handler: data => {
                  this.moneyGiven = data.Money;
                  console.log('Saved clicked, data: ' + this.moneyGiven.toString());
                  this.showPrompt2(50 - this.totalSum);
                },
             },
             {
                 text: 'Tasaraha',
                 handler: data => {
                   this.moneyGiven = data.Money;
                   console.log('Saved clicked, data: ' + this.moneyGiven.toString());
                   //this.showPrompt2(this.moneyBackAsFloat - this.totalSum);
                   this.confirmPayment();
                 },
              },
              {
                  text: 'Peruuta',
                  handler: data => {
                    console.log('Cancel clicked');
                  }
              },
          ]
      });
      prompt.present();
    }

  showPrompt2(moneyback) {
      const prompt = this.alertController.create({
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
      });
      prompt.present();
    }
  
  presentPromptItemsInShoppingCart() {
      let alert = this.alertController.create({
          title: 'Haluatko kirjautua ulos?',
          message: "Ostoskorissa on tuotteita! Ne poistetaan ostoskorista jos kirjaudut ulos." +
          		"(Ostoskori ei tyhjene jos vain haluat vaihtaa käyttäjää.)",
          buttons: [
            {
              text: 'Kirjaudu ulos',
              handler: () => {
                console.log('Confirm Ok');
                var e = document.getElementById("current_cashier") as HTMLSelectElement;
                e.selectedIndex = 0;
                this.shoppingCart.clearAll();
              }
            },
            {
                text: 'Peruuta',
                    handler: () => {
                        console.log('Cancel');
                    }
             }
          ]
      });
      alert.present();
  }
  
  presentPromptNoItemsInStock(productInfo) {
      let alert = this.alertController.create({
          title: 'Tarkista tuotteen saatavuus',
          message: "Varastokirjanpidon mukaan tuote on loppu",
          buttons: [
            {
              text: 'Laita silti ostoskoriin',
              handler: () => {
                console.log('Confirm Ok');
                this.shoppingCart.addProduct(productInfo);
                this.update();
              }
            },
            {
                text: 'Peruuta',
                    handler: () => {
                        console.log('Cancel');
                    }
             }
          ]
      });
      alert.present();
  }
  
  presentLoading(text) {
      this.loadingIndicator = this.loadingCtrl.create({
        content: text
        //duration: 3000;
      });
      this.loadingIndicator.present();
    }

  finishLoading() {
      this.loadingIndicator.dismiss();
  }
}
