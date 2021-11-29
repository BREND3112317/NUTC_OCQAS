let app = document.getElementById("app");
let DEBUG = false;
/* Popup View */
// pre_elfSend = function(data) {

building = () => {
    let bAllStart = document.getElementById("allWorkStart")
    bAllStart.addEventListener("click", () => {
        allPlayWork();
    })
    let StopAllWork_b = document.getElementById("allWorkStop")
    StopAllWork_b.addEventListener("click", () => {
        stopAllWork();
    })
}

pre_buildingApp = () => {
    chrome.storage.sync.get(["electives", "run", "token"], ({ electives, run, token }) => {
        buildingApp(electives, run, token)
    });
}

buildingApp = (electives, run, token) => {
    if(DEBUG) {
        console.log("DEBUG", electives);
    }
    

    // let dInfo = document.createElement("div");
    // dInfo.className = "input-group mb-3";
    // dInfo.innerHTML = `<span class="input-group-text" id="token-addon1">Token</span><input type="text" class="form-control" placeholder="token" aria-label="token" aria-describedby="token-addon1" value="${token}">`

    // let dControl = document.createElement("div");
    // dControl.className = "d-flex p-2";
    // dControl.innerHTML = `<div class="input-group"><button class="btn btn-${run === true ? "danger" : "success"}">${run === true ? "停止" : "開始"}</button></div>`
    // dControl.querySelector("div > button").addEventListener("click", () => {
    //     allPlayWork()
    // })
    
    let ulElectiveList = document.getElementById("electiveList")
    ulElectiveList.className = "list-group";
    electives.map((elective) => {
        let liElective = document.createElement("li");
        liElective.className = "list-group-item d-flex justify-content-between align-items-center"
        liElective.setAttribute("data-ccid", elective.ccid);
        let dTitle = document.createElement("div");
        dTitle.className = "me-auto";
        let bControlItem = document.createElement("div")
        bControlItem.className = "btn-group"
        let bStart = document.createElement("button");
        if(elective.status.run==false){
            bStart.className = "btn btn-outline-primary"
            bStart.innerHTML = `<i class="bi bi-play"></i>`
            bStart.setAttribute("data-status", "play");
        }else{
            bStart.className = "btn btn-outline-danger"
            bStart.innerHTML = `<i class="bi bi-stop"></i>`
            bStart.setAttribute("data-status", "stop");
        }
        bStart.addEventListener("click", (e) => {
            switchWork(e.currentTarget, elective.ccid)
        });
        let bDelete = document.createElement("button");
        bDelete.className = "btn btn-outline-secondary"
        bDelete.innerHTML = `<i class="bi bi-trash"></i>`
        bDelete.addEventListener("click", deleteWork)
        bControlItem.append(bStart);
        bControlItem.append(bDelete);
        dTitle.appendChild(bControlItem)
        let pName = document.createElement("span")
        pName.className = "px-2"
        pName.innerText = elective.name
        
        dTitle.append(pName);
        liElective.append(dTitle);
        ulElectiveList.appendChild(liElective)
    });

    // app.appendChild(dInfo)
    // app.appendChild(ulElectiveList)
    // app.appendChild(dControl)
}

buildElectiveElement = (elective) => {
    let ccid = elective.ccid
    let liElective = document.createElement("li");
    liElective.className = "list-group-item d-flex justify-content-between align-items-center"
    liElective.setAttribute("data-ccid", ccid);
    let dTitle = document.createElement("div");
    dTitle.className = "me-auto";
    let bControlItem = document.createElement("div")
    bControlItem.className = "btn-group"
    let bStart = document.createElement("button");
    bStart.className = "btn btn-outline-primary"
    bStart.innerHTML = `<i class="bi bi-play"></i>`
    bStart.setAttribute("data-status", "play");
    bStart.addEventListener("click", (e) => {
        switchWork(e.currentTarget, ccid)
    });
    let bDelete = document.createElement("button");
    bDelete.className = "btn btn-outline-secondary"
    bDelete.innerHTML = `<i class="bi bi-trash"></i>`
    bDelete.addEventListener("click", deleteWork)
    bControlItem.append(bStart);
    bControlItem.append(bDelete);
    dTitle.appendChild(bControlItem)
    let pName = document.createElement("span")
    pName.className = "px-2"
    pName.innerText = elective.name
    
    dTitle.append(pName);
    liElective.append(dTitle);
    document.getElementById("electiveList").appendChild(liElective)
}

deleteWork = (e) => {
    let il = e.currentTarget.parentNode.parentNode.parentNode;
    ccid = il.getAttribute("data-ccid");
    chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
        type = "delete"
        if(DEBUG)console.log(type, e, ccid)
        chrome.tabs.sendMessage(
            tabs[0].id, 
            {
                type,
                data: {
                    ccid
                }
            }, 
            function(response) {
                il.remove();
            }
        );
    });
    if(DEBUG)console.log("remove", il);
}

allPlayWork = () => {
    let lis = document.querySelectorAll("#electiveList > li")
    lis.forEach((li) => {
        const bStatus = li.querySelector("div > button")
        if(bStatus.getAttribute("data-status") === "play") {
            bStatus.click()
        }
    })
}

stopAllWork = () => {
    let lis = document.querySelectorAll("#electiveList > li")
    lis.forEach((li) => {
        const bStatus = li.querySelector("div > button")
        if(bStatus.getAttribute("data-status") === "stop") {
            bStatus.click()
        }
    })
}

switchWork = (e, ccid) => {
    if(DEBUG)console.log(e, ccid)
    chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
        type = e.getAttribute("data-status")
        if(DEBUG)console.log("click", e, type)
        chrome.tabs.sendMessage(
            tabs[0].id, 
            {
                type,
                data: {
                    ccid
                }
            }, 
            function(response) {
                if(DEBUG)console.log(type, response);
                if(type === "play") {
                    e.innerHTML = `<i class="bi bi-stop"></i>`
                    e.setAttribute("data-status", "stop");
                    e.className = "btn btn-outline-danger"
                }else{
                    e.innerHTML = `<i class="bi bi-play"></i>`
                    e.setAttribute("data-status", "play");
                    e.className = "btn btn-outline-primary"
                }
                
            }
        );
    });
}

/* Start */
chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
        if(DEBUG)console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
                if(DEBUG)console.log("request", request);
        if(request.type === "updateElectives") {
            pre_buildingApp();
        }else if(request.type === "createElective") {
            buildElectiveElement(request.data)
        }else if(request.type === "ThreadIsStop") {
            let il = document.querySelector(`#electiveList > li[data-ccid="${request.data.ccid}"]`);
            let bSwitch = il.querySelector("button");
            bSwitch.innerHTML = `<i class="bi bi-play"></i>`
            bSwitch.setAttribute("data-status", "play");
            bSwitch.className = "btn btn-outline-primary"
            if(il.querySelectorAll("span").length == 1){
                let spanBadge = document.createElement("span");
                spanBadge.className = `badge ${request.data.message == "Success" ? "bg-success" : "bg-danger"} rounded-pill`
                spanBadge.innerText = request.data.message
                il.append(spanBadge)
            }else {
                let spanBadge = il.querySelector("span.badge.bg-danger.rounded-pill")
                spanBadge.className = `badge ${request.data.message == "Success" ? "bg-success" : "bg-danger"} rounded-pill`
                spanBadge.innerText = request.data.message
                il.append(spanBadge)
            }
        }
});
building()
pre_buildingApp()

// todo: try let the browser opening to init the extension
// var bgp = chrome.extension.getBackgroundPage();
// console.log(bgp.incCounter());