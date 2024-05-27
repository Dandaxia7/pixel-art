import React, {useState} from "react";
import "./AIDraw.css"
const SERVER_URL = "http://127.0.0.1:5000";

function AIDraw(){
    const [showText,setShowText] = useState("请输入提示词");
    const [isLoading,setIsLoading] = useState(false);

    React.useEffect(() => {
        const canvas = document.getElementById("AICanvas");
        //绑定下载按钮
        var downloadBtn = document.querySelector("#download");
        downloadBtn.download = 'img.png';
        downloadBtn.href = canvas.toDataURL();
        if(!localStorage.getItem("username")){
            localStorage.setItem("username","");
        }
    },[]);

    const onSubmit = () => {
        let jsonObj = {};
        const input = document.getElementById("inputPrompt");
        const text = input.value ? input.value : "";
        //console.log(text,input.value);
        var user = JSON.parse(localStorage.getItem("user"));
        if(!user.isConnected){
            alert("请先登录!");
            return;
        }
        if(text === ""){
            setShowText("提示词不能为空");
            alert("提示词不能为空!");
            return;
        }
        
        setShowText("正在生成图片...");
        setIsLoading(true);

        fetch( SERVER_URL + "/api",{
                method: "POST",
                body: JSON.stringify({"username": user.username, "prompt": text, "n": 1}),
                headers: {"Content-Type": "application/json",'Access-Control-Allow-Origin': '*'},
            })
            .then(response => {
                // if (!response.ok) {
                //     throw new Error('Network response was not ok');
                // }
                return response.json();
            })
            .then((data) => {
                jsonObj = data;
                console.log(jsonObj);
                //console.log(jsonObj.imageData);
                const imageName = jsonObj.name;
                if(imageName === "" || imageName === "Failed to call image synthesis."){
                    setShowText("图片生成失败");
                    return;
                }else{
                    const img = new Image();
                    const imgURL = 'data:image/png;base64,' + jsonObj.imageData;
                    img.src = imgURL;
                    // console.log(img.src);
                    //user.pictures.push(imgURL);
                    //console.log(user.pictures.length);
                    //localStorage.setItem("user", JSON.stringify(user));

                    img.onload = function() {
                        const canvas = document.getElementById("AICanvas");
                        const ctx = canvas.getContext("2d");
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        setShowText("图片已生成");
                        setIsLoading(false);
                        //绑定下载按钮
                        var downloadBtn = document.querySelector("#download");
                        downloadBtn.download = 'img.png';
                        downloadBtn.href = canvas.toDataURL();
                    }
                }
            })
            .catch(error => setShowText(error));
    }

    return (
        <div id="AIDraw">
            <div className="toolBar">
                <h1>智绘</h1>
                <div id="prompt">
                    <p>{"AI绘图-"+showText}</p>
                    <textarea id="inputPrompt" type="text"></textarea>
                    <button id="submitPrompt" onClick={onSubmit}>提交</button>
                    <a href="/AIdraw" id="download" className="btn btn-download">下载图片</a>
                </div>
            </div>
                
            <div className="bodyBar">
                <canvas id="AICanvas" width="850" height="850"></canvas>
                <div className="square" style={{opacity: isLoading ? 1 : 0}}>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    )
}

export default AIDraw;