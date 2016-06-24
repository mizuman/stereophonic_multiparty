var multiparty;

function start() {
    // MultiParty インスタンスを生成
    multiparty = new MultiParty( {
        "key": "78dd2be1-6a65-4676-b36c-d6f519a478de",
        "reliable": true,
        "debug": 1,
        "panner": true
    });

    /////////////////////////////////
    // for MediaStream
    multiparty.on('my_ms', function(video) {
        // 自分のvideoを表示
        var vNode = MultiParty.util.createVideoNode(video);
        vNode.setAttribute("class", "video my-video");
        $(vNode).find("video")[0].volume = 0;
        $(vNode).appendTo("#streams");
    }).on('peer_ms', function(video) {
        // peerのvideoを表示
        var vNode = MultiParty.util.createVideoNode(video);
        vNode.setAttribute("class", "video peer-video");
        $(vNode).find("video")[0].volume = 0;

        // console.log($(vNode).find(".pannerSlide"));
        // console.log(video)

        $(vNode).find(".pannerSlide").on(`input`,function(){
            var param = {
                node: "panner",
                type: "setPosition",
                param: {
                    x: $(this).val()
                }
            }
            multiparty.setParamWebAudioNode_(video.id, param);
        }).change(function(){
            var param = {
                node: "panner",
                type: "setPosition",
                param: {
                    x: $(this).val()
                }
            }
            multiparty.setParamWebAudioNode_(video.id, param);
        })
        
        $(vNode).appendTo("#streams");
    }).on('ms_close', function(peer_id) {
        // peerが切れたら、対象のvideoノードを削除する
        $("#"+peer_id+"_div").remove();
    })

    ////////////////////////////////
    // for DataChannel
    multiparty.on('message', function(mesg) {
        // peerからテキストメッセージを受信
        $("p.receive").append(mesg.data + "<br>");
    });

    ////////////////////////////////
    // Error handling
    multiparty.on('error', function(err) {
        alert(err);
    });

    multiparty.start();

    //////////////////////////////////////////////////////////
    // テキストフォームに入力されたテキストをpeerに送信
    $("#message form").on("submit", function(ev) {
        ev.preventDefault();    // onsubmitのデフォルト動作（reload）を抑制

        // テキストデータ取得
        var $text = $(this).find("input[type=text]");
        var data = $text.val();

        if(data.length > 0) {
            data = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            $("p.receive").append(data + "<br>");

            // メッセージを接続中のpeerに送信する
            multiparty.send(data);
            $text.val("");
        }
    });

    ///////////////////////////////////////////////////
    // handle mute/unmute
    $("#video-mute").on("click", function(ev) {
        var mute = !$(this).data("muted");
        multiparty.mute({video: mute});
        $(this).text("video " + (mute ? "unmute" : "mute")).data("muted", mute);
    });

    $("#audio-mute").on("click", function(ev) {
        var mute = !$(this).data("muted");
        multiparty.mute({audio: mute});
        $(this).text("audio " + (mute ? "unmute" : "mute")).data("muted", mute);
    });
}

document.addEventListener("DOMContentLoaded", function(){
    start();
})