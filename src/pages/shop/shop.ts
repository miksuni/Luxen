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
    
  //productObject: string ="";
  //productNumber: string = "";
  //productName: string = "";
  productNumberInitials: string = "";
  productNameInitials: string = "";
  //price: string = "";
  //amountInStock: string = "";
  //inProductionInfo: string = "";
    
  cartContent = [];
  receiptContent = [];
  searchResult: any;
  
  sites = [{id:'Lahti'}];
  cashiers: any;
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
    this.cartContent = this.shoppingCart.getProducts();
    this.getCashiers();
    this.update();
  }
  
  clear() {
      /*this.productNumber = "";
      this.productName = "";
      this.price = "";
      this.amountInStock = "";
      this.inProductionInfo = "";*/
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
  
  onCashierChange($event){
      console.log('>> onCashierChange: ' + $event);
      this.cashier = $event;
      this.shoppingCart.setCashier(this.cashier);
  }
  
  onProductInputClicked() {
      console.log('>> shop.onProductInputClicked:');
      if (this.cashier.length == 0) {
          this.presentPromptSelectCashier();
          return;
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
          this.clear();
          if (this.searchResult.length == 1) {
              console.log('>> found item: ' + found[0].productName);
              this.showProduct(found[0]);
          }
      }
  }

  onProductNameUpdated() {
      console.log('>> shop.onProductNameUpdated: ' + this.productNameInitials);
      document.getElementById("receipt_view").style.visibility = "hidden";
      var found = this.productList.getProductByName(this.productNameInitials);
      this.searchResult = found;
      console.log('>> found: ' + found.length);
      console.log('>> json: ' + JSON.stringify(found));
      this.clear();
  }
  
  onProductSelected(productName, index) {
      console.log('>> shop.onProductSelected: ' + productName + ' index: ' + index);
      this.showProduct(this.searchResult[index]);
      this.searchResult.splice(0,this.searchResult.length)
    }

  addToShoppingCart(productInfo) {
      this.shoppingCart.addProduct(productInfo);
      this.update();
  }
  
  showProduct(productInfo) {
      console.log('>> shop.showProduct: ' + JSON.stringify(productInfo));
      this.addToShoppingCart(productInfo);
      //this.productInfo = productInfo;
      //this.productNumber = productInfo.ISBN;
      //this.productName = productInfo.productName;
      //this.price = productInfo.price;
      //this.amountInStock = productInfo.amountInStock;
      /*if (!productInfo.availableFromPublisher) {
          this.inProductionInfo = "(Poistunut tuote)";
      } else {
          this.inProductionInfo = "";
      }*/
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

  increase(productName, i) {
      console.log('increase: ' + productName + ", index: " + i);
      this.shoppingCart.increase(i);
      this.update();
  }

  decrease(productName, i) {
      console.log('decrease: ' + productName + ", index: " + i);
      this.shoppingCart.decrease(i);
      this.update();
  }

  cashPayment() {
      console.log('cashPayment');
      this.showPrompt();
      console.log('Saved clicked, data: ' + this.moneyGiven.toString());
      this.setPaymentMethod("Käteinen");
  }
  
  cardPayment() {
    console.log('cardPayment');
    this.setPaymentMethod("Maksukortti");
    this.presentPromptPaymentCardInstructions();
  }

  connectToPT() {
    console.log('connectToPT');
    this.shoppingCart.connectToPT();
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
    console.log('checkIfCardPaymentEnabled');
    return !this.cardPaymentEnabled;
  }

  checkIfCashPaymentEnabled() {
    console.log('checkIfCashPaymentEnabled');
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
