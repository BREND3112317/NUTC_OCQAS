var DEBUG = true;
var thread_list = {};
var token = document.querySelector("#ctl00_Head1 > script:nth-child(17)").innerText.split("token:'")[1].split("', type")[0];
var type = document.querySelector("#ctl00_Head1 > script:nth-child(17)").innerText.split("token:'")[1].split("', type")[1].split(": '")[1].split("'")[0];
// (() => {
//     window.log = function(s) {
//     };
//   })(window.log);

tableUpdate = () => {
    let trs = document.querySelectorAll("#course_tab > tbody > tr")
    // let index = 0;
    trs.forEach((tr) => {
        if(tr.className !== "tr_even"){
            let ccid = tr.querySelector("td.stu_num").getAttribute("data-ccid-num");
            let name = tr.querySelector("td.subject").innerText;
            let tdAdd2AE = document.createElement("td");
            let add2AE = document.createElement("button");
            add2AE.className = "btn btn-sm btn-default"
            add2AE.setAttribute("data-ccid", ccid);
            add2AE.setAttribute("data-name", name);
            add2AE.addEventListener("click", createElective)
            add2AE.innerText = "自動選課"
            tdAdd2AE.appendChild(add2AE)
            tr.appendChild(tdAdd2AE)
            // console.log(tr)
        }else{
            let th = document.createElement("th")
            th.innerText = "Automatic";
            tr.append(th)
        }
        
    });
}

// 課程加選-自動選課 button
createElective = (e) => {
    let e_index = parseInt(e.currentTarget.parentNode.parentNode.querySelector("td").innerText)+1;
    let e_ccid = e.currentTarget.getAttribute("data-ccid");
    let e_name = e.currentTarget.getAttribute("data-name");
    chrome.storage.sync.get("electives", ({ electives }) => {
        let isExist = (elective) => {
            return elective.ccid == ccid;
        }
        if(electives.some(isExist) == false) {
            chrome.runtime.sendMessage(
                {
                    type: "createElective",
                    data: {
                        ccid: e_ccid,
                        name: e_name
                    }
                }, function(response) {
                    electives.push({
                        index: e_index,
                        ccid: e_ccid,
                        name: e_name,
                        status: {
                            run: false,
                            lastMessage: "", 
                            errorTimes: 0
                        }
                    });
                    chrome.storage.sync.set({electives})
                }
            )
        }
        // console.log(electives.some(isExist), electives)
    });
}

deleteElective = ({ccid}) => {
    chrome.storage.sync.get("electives", ({ electives }) => {
        electives.forEach((elective, key) => {
            if(elective.ccid == ccid){
                electives.splice(key, 1)
            }
        })
        chrome.storage.sync.set({electives})
    })
}

clearThread = ({ccid, message}) => {
    // console.log("clearThread", ccid, message)
    if(typeof thread_list[ccid] !== "undefined") {
        clearInterval(thread_list[ccid]);
        chrome.runtime.sendMessage(
            {
                type: "ThreadIsStop",
                data: {
                    ccid,
                    message
                }
            }
        );
        chrome.storage.sync.get("electives", ({ electives }) => {
            electives.forEach((elective, key) => {
                if(elective.ccid == ccid){
                    elective.status.run = false;
                    elective.status.lastMessage = message;
                }
            })
            chrome.storage.sync.set({electives})
        })
    }
}

updateThread = ({ccid, message}) => {
    if(typeof thread_list[ccid] !== "undefined") {
        clearInterval(thread_list[ccid]);
        chrome.runtime.sendMessage(
            {
                type: "ElectiveFailed",
                data: {
                    ccid,
                    message
                }
            }
        );
        chrome.storage.sync.get("electives", ({ electives }) => {
            electives.forEach((elective, key) => {
                if(elective.ccid == ccid){
                    elective.status.run = false;
                    elective.status.lastMessage = message;
                }
            })
            chrome.storage.sync.set({electives})
        })
    }
}

startThread = ({ccid}) => {
    thread_list[ccid] = setInterval(() => {
        _ajax(
            {ccid: ccid, op: "add", token: token, type: type},
            {
                success: (res) => {
                    if(DEBUG)console.log(`選課 post 送出 ccid: ${ccid}`)
                    resData = JSON.parse(res.d);
                    resData.forEach((resd) => {
                        if(resd.type == "cust_handler") {
                            if(resd.args[0] == "true"){
                                if(DEBUG)console.log("[resd] success", resd)
                                let message = "Success"
                                clearThread({ccid, message})
                            }else{
                                if(DEBUG)console.log("[resd] failed", resData)
                                chrome.storage.sync.get("electives", ({ electives }) => {
                                    electives.forEach((elective, key) => {
                                        if(elective.ccid == ccid){
                                            elective.status.run = true;
                                            elective.status.errorTimes++;
                                        }
                                    })
                                    chrome.storage.sync.set({electives})
                                })
                            }
                        }else if(resd.type == "function") {
                            let message = resd.args[0];
                            if(resd.args[0] == '本課程時間衝堂'){
                                if(DEBUG)console.log("[resData] failed", '本課程時間衝堂')
                                clearThread({ccid, message})
                            }else if(resd.args[0] == "本課程加入後將超過修業學分上限") {
                                if(DEBUG)console.log("[resData] failed", '本課程加入後將超過修業學分上限')
                                clearThread({ccid, message})
                            }
                            
                        }
                    })
                },
                error: (e) => {
                    if (window.top != window.self) // checks top window
                        alert(JSON.encode(e));
                    else {
                        var msg;
                        try {
                            msg = JSON.decode(e.responseText);
                        }
                        catch (ex1) {
                        }
        
                        if (msg != null && msg.Message != null)
                            alert(msg.Message);
                        else {
                            var msg = e.responseText.replace('<', '&lt;');
                            if (msg.length == 0)
                                msg = "Failed to call <strong>'" + ajax_url + "'</strong> !";
                            var html = "<div class='alert alert-danger' style='z-index:999;position:absolute;width:98%;'>" + msg + "</div>";
                            $('body:first').append(html);
                        }
                    }
                }
            }
        )}
    , 500);
    if(DEBUG)console.log("startThread", thread_list);
}

_ajax = (data, callback) => {
    $.ajax({
        'type': "POST",
        "contentType": "application/json; charset=utf-8",
        'cache': false,
        'url': "/student/WebService.asmx/stuClassMod",
        'data': JSON.stringify({strParam:JSON.stringify(data)}),
        'success': callback.success,
        'error': callback.error
    })
}

chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
        console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
        console.log("request", request);
        if (request.type == "Who are you"){
            var title = "class_add_drop";
            sendResponse(title)
        }else if(request.type == "play"){
            sendResponse(startThread(request.data))
        }else if(request.type == "stop") {
            sendResponse(clearThread(request.data))
        }else if(request.type == "delete") {
            let clearData = {ccid: request.data.ccid, message:"delete -> clear"};
            clearThread(clearData)
            deleteElective(request.data)
        }
});
chrome.storage.sync.set({token});
console.log("elective.js is inject")
console.log("token", token)
console.log("type", type)
tableUpdate();
