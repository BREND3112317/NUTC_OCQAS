// let electives = [{ccid: '8654', name: "科學應用與創意學習  (自然科學領域)"}];
let electives = [];
let millisecondsToWait = 500;

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({electives, run});

    console.log('Default background electives set to []', `electives:`, electives);
})
