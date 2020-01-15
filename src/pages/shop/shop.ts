import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProductList } from '../../providers/productlist/productlist';
import { ShoppingcartProvider } from '../../providers/shoppingcart/shoppingcart';
import { RestProvider } from '../../providers/rest/rest';
import { AlertController } from 'ionic-angular';

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
    
  productObject: string ="";
  productNumber: string = "";
  productName: string = "";
  productNumberInitials: string = "";
  productNameInitials: string = "";
  price: string = "";
  amountInStock: string = "";
  inProductionInfo: string = "";
    
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
  
  moneyBackAsStr = "";
  moneyBackAsFloat: number = 0.0;

  cardPaymentEnabled: boolean = false;
  cashPaymentEnabled: boolean = false;
  confirmButtonsEnabled: boolean = false;
  
  cashier = "";

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public productList: ProductList,
              private shoppingCart: ShoppingcartProvider,
              public restProvider: RestProvider,
              private alertController: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShopPage');
    document.getElementById("card_payment_guide").style.visibility = "hidden";
    document.getElementById("cash_payment_guide").style.visibility = "hidden";
    document.getElementById("receipt_view").style.visibility = "hidden";
    this.productList.getProductInfo();
    this.cartContent = this.shoppingCart.getProducts();
    this.getCashiers();
    this.update();
  }
  
  clear() {
      this.productNumber = "";
      this.productName = "";
      this.price = "";
      this.amountInStock = "";
      this.inProductionInfo = "";
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
      this.productInfo = productInfo;
      this.productNumber = productInfo.ISBN;
      this.productName = productInfo.productName;
      this.price = productInfo.price;
      this.amountInStock = productInfo.amountInStock;
      if (!productInfo.availableFromPublisher) {
          this.inProductionInfo = "(Poistunut tuote)";
      } else {
          this.inProductionInfo = "";
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

  cardPayment() {
    console.log('cardPayment');
    //document.getElementById("card_payment_guide").style.visibility = "visible";
    //document.getElementById("cash_payment_guide").style.visibility = "hidden";
    this.presentPromptPaymentCardInstructions();
    this.setPaymentMethod("Maksukortti");
    this.confirmButtonsEnabled = true;
  }

  connectToPT() {
    console.log('connectToPT');
    this.shoppingCart.connectToPT();
  }

  confirmPayment() {
    console.log('confirmPayment');
    this.receiptContent = Array.from(this.cartContent);
    this.receiptTotalSumAsString = this.totalSumAsString;
    this.shoppingCart.saveReceipt();
    this.shoppingCart.clearAll();
    this.update();
    document.getElementById("receipt_view").style.visibility = "visible";
    this.cardPaymentEnabled = false;
    this.cashPaymentEnabled = false;
    this.confirmButtonsEnabled = false;
  }

  cancelPurchase() {
    console.log('cancelPurchase');
    document.getElementById("receipt_view").style.visibility = "hidden";
    this.shoppingCart.clearAll();
    this.update();
  }

  cashPayment() {
    console.log('cashPayment');
    //document.getElementById("card_payment_guide").style.visibility = "hidden";
    //document.getElementById("cash_payment_guide").style.visibility = "visible";
    this.showPrompt();
    //this.presentAlertPrompt();
    console.log('--Saved clicked, data: ' + this.moneyBackAsStr);
    console.log('--Saved clicked, data: ' + this.moneyBackAsFloat.toString());
    this.setPaymentMethod("Käteinen");
    this.confirmButtonsEnabled = true;
  }

  checkIfCardPaymentEnabled() {
    console.log('checkIfCardPaymentEnabled');
    return !this.cardPaymentEnabled;
  }

  checkIfCashPaymentEnabled() {
    console.log('checkIfCashPaymentEnabled');
    return !this.cardPaymentEnabled;
  }

  checkIfConfirmButtonsEnabled() {
    console.log('checkIfConfirmButtonsEnabled');
    return !this.confirmButtonsEnabled;
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
      this.confirmButtonsEnabled = false;
      //document.getElementById("cashback_fields").style.visibility = "hidden";
      document.getElementById("card_payment_guide").style.visibility = "hidden";
      document.getElementById("cash_payment_guide").style.visibility = "hidden";
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
              console.log('Confirm Ok');
            }
          }
        ]
      });
      alert.present();
    }
  
  async presentAlertPrompt() {
      const alert = await this.alertController.create({
        //header: 'Prompt!',
        inputs: [
          {
            name: 'name1',
            type: 'text',
            placeholder: 'Placeholder 1'
          },
          {
            name: 'name2',
            type: 'text',
            id: 'name2-id',
            value: 'hello',
            placeholder: 'Placeholder 2'
          },
          {
            name: 'name3',
            value: 'http://ionicframework.com',
            type: 'url',
            placeholder: 'Favorite site ever'
          },
          // input date with min & max
          {
            name: 'name4',
            type: 'date',
            min: '2017-03-01',
            max: '2018-01-12'
          },
          // input date without min nor max
          {
            name: 'name5',
            type: 'date'
          },
          {
            name: 'name6',
            type: 'number',
            min: -5,
            max: 10
          },
          {
            name: 'name7',
            type: 'number'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {
            text: 'Ok',
            handler: () => {
              console.log('Confirm Ok');
            }
          }
        ]
      });

      await alert.present();
    }
  
  showPrompt() {
      const prompt = this.alertController.create({
        title: 'Syötä summa: ',
        message: "Asiakkaan antama summa",
        inputs: [
          {
            name: 'Money',
            type: 'number',
            placeholder: '20'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Save',
            handler: data => {
              //this.moneyBackAsFloat = parseFloat(JSON.stringify(data.Money));
              //this.moneyBackAsStr = JSON.stringify(data.Money);
              //this.moneyBackAsFloat = parseFloat(this.moneyBackAsStr);
              //console.log('Saved clicked, data: ' + this.moneyBackAsStr);
              this.moneyBackAsFloat = data.Money;
              console.log('Saved clicked, data: ' + this.moneyBackAsFloat.toString());
              //this.showPrompt2(parseFloat(JSON.stringify(data.Money)) /* - this.totalSum*/);
              //this.showPrompt2(6.0);
              this.showPrompt2(this.moneyBackAsFloat - this.totalSum);
            }
          }
        ]
      });
      prompt.present();
    }

  showPrompt2(moneyback) {
      const prompt = this.alertController.create({
        //title: 'Takaisin',
        message: "Ole hyvä ja duunaa takas mani: " + moneyback.toString(),
        inputs: [
          {
            name: 'Money',
            placeholder: '20'
          }
        ],
        buttons: [
          /*{
            text: 'Cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },*/
          {
            text: 'OK',
            handler: data => {
              console.log('Saved clicked, data: ' + JSON.stringify(data.Money));
            }
          }
        ]
      });
      prompt.present();
    }
}
