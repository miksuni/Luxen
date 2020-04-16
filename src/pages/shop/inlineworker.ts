import { Observable, Subject } from 'rxjs';

export class InlineWorker {

  private readonly worker: Worker;
  private onMessage = new Subject<MessageEvent>();
  private onError = new Subject<ErrorEvent>();

  constructor(func) {
    console.log('InlineWorker');
    const WORKER_ENABLED = !!(Worker);

    if (WORKER_ENABLED) {
      console.log('InlineWorker enabled');
      this.worker = new Worker("../assets/check_connection.js");

      this.worker.onmessage = (data) => {
	    console.log('InlineWorker.onmessage ' + data.data);
        this.onMessage.next(data);
      };

      this.worker.onerror = (data) => {
	    console.log('InlineWorker.onerror');
        this.onError.next(data);
      };
      //this.waitForCardPayment();
      //this.postMessage({"myparam:":4});

    } else {
	  console.log('InlineWorker not enabled');
      throw new Error('WebWorker is not enabled');
    }
  }

  postMessage(data) {
	console.log('InlineWorker.postMessage: ' + JSON.stringify(data));
    this.worker.postMessage(data);
  }

  onmessage(): Observable<MessageEvent> {
	console.log('InlineWorker.postMessage');
    return this.onMessage.asObservable();
  }

  onerror(): Observable<ErrorEvent> {
	console.log('InlineWorker.onmessage');
    return this.onError.asObservable();
  }

  terminate() {
	console.log('InlineWorker.terminate 1');
    if (this.worker) {
	  console.log('InlineWorker.terminate 2');
      this.worker.terminate();
    }
  }

    /*async waitForCardPayment() {
	  for (let i = 0; i < 5; i++) {
         let promise = new Promise((res, rej) => {
             setTimeout(() => res("loop"), 10000)
          });

          // wait until the promise returns us a value
          let result = await promise; 
          console.log("loop");
          this.postMessage(i);
       }
    }*/

}