function call_ajax() {
    var ajax_url, data={strParam:"{}"};
    if (arguments.length > 0)
        ajax_url = arguments[0];
    if (arguments.length > 1) {
        if (typeof (arguments[1]) == "object") {
            var obj = arguments[1];
            // force to string type
            for (var key in obj)
                obj[key] = '' + obj[key];
        }
        else {
            alert("The first parameter for calling 'call_ajax' function must be an object !");
            return;
        }

        data.strParam = JSON.encode(arguments[1]);
    }

    if (arguments.length > 2) {
        if (typeof (arguments[2]) == "function") {
            $.ajax_cust_handler = arguments[2] ;
        }
        else {
            alert("The second parameter for calling 'call_ajax' function must be a function !");
            return;
        }
    }

    $.ajax({
        'type': "POST",
        "contentType": "application/json; charset=utf-8",
        'cache': false,
        'url': ajax_url,
        'data': JSON.encode(data),
        'success': ajax_resp_handler,
        'error': function (e) {
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
    });
}

var param = { ccid: ccid, op:'add', token:'e8243a92-3652-4e80-89ae-77ff0ef0d024', type: 'curr_sel' };
call_ajax("/student/WebService.asmx/stuClassMod", param,
          function (res) {
                show_cover(0);
                if( res )
                {
                    alert('加選成功.');
                    location.reload();
                }
          });

$.ajax({
    'type': "POST",
        "contentType": "application/json; charset=utf-8",
        'cache': false,
        'url': "/student/WebService.asmx/stuClassMod",
        'data': JSON.encode({strParam:JSON.encode(data)}),
        'success': function(res) {
            
        },
        'error': function (e) {
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
})