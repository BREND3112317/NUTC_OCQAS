


// let electives = [{ccid: '8654', name: "科學應用與創意學習  (自然科學領域)"}];
var DEBUG = true;
var thread_list = {};
let electives = [];
let millisecondsToWait = 500;

chrome.runtime.onInstalled.addListener((request, sender, sendResponse) => {
    if(DEBUG)console.log("[DEBUG] request", request);
    if(DEBUG)console.log("[DEBUG] sender", sender);
})
chrome.storage.sync.set({electives});
console.log('Default background electives set to []', `electives:`, electives);

// todo: try let the browser opening to init the extension
// var counter = 0;
// function incCounter(){
//     return window.counter++;
// }



try {
    importScripts('./static/js/jquery.js', "./static/js/util.js"/*, and so on */);
} catch (e) {
    console.error(e);
}


// hello()
// sayHello("The World")

// util.hello()
// util.sayHello("Jojo")