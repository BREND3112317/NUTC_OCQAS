let app = document.getElementById("app");

/* Popup View */
// pre_elfSend = function(data) {

building = () => {
    let bAllStart = document.getElementById("allWorkStart")
    bAllStart.addEventListener("click", () => {
        allPlayWork();
    })
}

pre_buildingApp = () => {
    chrome.storage.sync.get(["electives", "run", "token"], ({ electives, run, token }) => {
        buildingApp(electives, run, token)
    });
}

buildingApp = (electives, run, token) => {
    console.log("DEBUG", electives);

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
        bStart.className = "btn btn-primary"
        bStart.innerHTML = `<i class="bi bi-play"></i>`
        bStart.setAttribute("data-status", "play");
        bStart.addEventListener("click", (e) => {
            switchWork(e.currentTarget, elective.ccid)
        });
        let bDelete = document.createElement("button");
        bDelete.className = "btn btn-secondary"
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
    bStart.className = "btn btn-primary"
    bStart.innerHTML = `<i class="bi bi-play"></i>`
    bStart.setAttribute("data-status", "play");
    bStart.addEventListener("click", (e) => {
        switchWork(e.currentTarget, ccid)
    });
    let bDelete = document.createElement("button");
    bDelete.className = "btn btn-secondary"
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
        console.log(type, e, ccid)
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
    console.log("remove", il);
}

allPlayWork = () => {
    console.log("test");
    let lis = document.querySelectorAll("#electiveList > li")
    lis.forEach((li) => {
        const bStatus = li.querySelector("div > button")
        if(bStatus.getAttribute("data-status") === "play") {
            bStatus.click()
        }
    })
}

switchWork = (e, ccid) => {
    console.log(e, ccid)
    chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
        type = e.getAttribute("data-status")
        console.log("click", e, type)
        chrome.tabs.sendMessage(
            tabs[0].id, 
            {
                type,
                data: {
                    ccid
                }
            }, 
            function(response) {
                console.log(type, response);
                if(type === "play") {
                    e.innerHTML = `<i class="bi bi-stop"></i>`
                    e.setAttribute("data-status", "stop");
                    e.className = "btn btn-danger"
                }else{
                    e.innerHTML = `<i class="bi bi-play"></i>`
                    e.setAttribute("data-status", "play");
                    e.className = "btn btn-primary"
                }
                
            }
        );
    });
}

/* Start */
chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
        console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
        console.log("request", request);
        if(request.type === "updateElectives") {
            pre_buildingApp();
        }else if(request.type === "createElective") {
            buildElectiveElement(request.data)
        }else if(request.type === "ThreadIsStop") {
            let il = document.querySelector(`#electiveList > li[data-ccid="${request.data.ccid}"]`);
            let bSwitch = il.querySelector("button");
            bSwitch.innerHTML = `<i class="bi bi-play"></i>`
            bSwitch.setAttribute("data-status", "play");
            bSwitch.className = "btn btn-primary"
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
            // console.log("stop", il)
        }
});
building()
pre_buildingApp()