import React, { useEffect, useRef, useState } from "react";
import "./Pixel.css";


function Pixel(){
    const [threshold, setThreshold] = useState(128);
    const [scale, setScale] = useState(0.1);
    const refImage = useRef(null);
    const [mode, setMode] = useState({value: 0});

    useEffect(()=>{
        renderPicture();
    },[scale,mode])

    const thresholdConvert = function(ctx, imageData, threshold, mode) {
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            var red = data[i];
            var green = data[i + 1];
            var blue = data[i + 2];
            var alpha = data[i + 3];
            var gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 *data[i + 2];
            var color = gray >= threshold ? 255 : 0;
            data[i]     = (mode.value == 0 && color == 0) ? red : color;    // red
            data[i + 1] = (mode.value == 0 && color == 0) ? green : color;  // green
            data[i + 2] = (mode.value == 0 && color == 0) ? blue : color;   // blue
            data[i + 3] = alpha >= threshold ? 255 : 0;               // 去掉透明
        }
        ctx.putImageData(imageData, 0, 0);
    };
    const renderPicture = () => {
        if(!refImage.current){
            //alert("请先上传图片");
            return;
        }
        var canvasTemp = document.createElement("canvas");
        var context = canvasTemp.getContext("2d");

        var image = new Image();
        image.src = refImage.current;
        image.onload = function() {
            canvasTemp.width = image.width * scale;
            canvasTemp.height = image.height * scale;
            context.drawImage(image, 0, 0, canvasTemp.width, canvasTemp.height);
            var imageData = context.getImageData(0, 0, canvasTemp.width, canvasTemp.height);
            thresholdConvert(context, imageData, threshold, mode);
            var dataURL = canvasTemp.toDataURL();
            var canvas = document.querySelector("#canvas");
            var ctx = canvas.getContext("2d");
            var img = new Image();
            img.src = dataURL;
            img.onload = function() {
                canvas.width = img.width / scale *2;
                canvas.height = img.height / scale *2;
                ctx.imageSmoothingEnabled = false;
                ctx.mozImageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.msImageSmoothingEnabled = false;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                var downloadBtn = document.querySelector("#download");
                downloadBtn.download = 'pixel.png';
                downloadBtn.href = canvas.toDataURL();
            }
        }
    }
    
    return (
        <div className="container1">
            <div className="sidebar">
                <h1>像素化</h1>

                <input id="img-upload" type="file" accept="image/*" onChange={(e)=>{
                    var file = e.target.files[0];
                    if (!file.type.match('image.*')) {
                        return;
                    }
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function(arg) {
                        refImage.current = arg.target.result;
                        var img = '<img class="preview" src="' + arg.target.result + '" alt="preview" >';
                        const preImage = document.querySelector('#img-preview');
                        if(preImage) preImage.innerHTML = img;
                        renderPicture();
                    }
                }} />
                <label for="img-upload" className="btn btn-upload">+ 上传图片</label>
                <div id="img-preview">未上传</div>

                <div className="threshold">
                    <div className="threshold-checkbox">
                        <label for="threshold-on">阈值 (0 ~ 255):</label>
                    </div>

                    <div className="threshold-range" id="threshold-range">
                        <button id="subtract" className="btn-small" onClick={()=>{
                            setThreshold(threshold-1);
                            renderPicture();
                        }}>-</button>
                        <input type="range" min="0" max="255" step="1" name="level" value={threshold} onChange={(e)=>{
                            setThreshold(e.target.value);
                            renderPicture();
                        }} id="threshold-level" />
                        <button id="add" className="btn-small" onClick={()=>{
                            setThreshold(threshold+1);
                            renderPicture();
                        }}>+</button>
                        <span className="threshold-val">{threshold}</span>
                    </div>
                </div>

                <div className="mode" id="mode-panel">
                    <span className="mode">模式：</span>
                    <input type="radio" name="mode" id="mode-black" className="option" checked={mode.value == 1?"checked":''} onClick={()=>{
                        setMode((mode)=>{
                            const newmode = {...mode,value: 1};
                            return newmode;
                        });
                        renderPicture();}} /><label for="mode-black">黑白</label>
                    <input type="radio" name="mode" id="mode-color" className="option" checked={mode.value == 0?"checked":''} onClick={()=>{
                        setMode((mode)=>{
                            const newmode = {...mode,value: 0};
                            return newmode;
                        });
                        renderPicture();}} /><label for="mode-color">彩色</label>
                </div>

                <div class="scale">
                    <label for="scale">缩放值 (像素大小):</label>
                    <input type="number" min="0.01" max="1" step="0.01" value={scale} name="scale" id="scale" onChange={(e)=>{setScale(e.target.value<=0.01?0.01:e.target.value);renderPicture();}} />
                </div>

                <a href="/pixel" id="download" className="btn btn-download">下载图片</a>
            </div>

            <div className="main">
                <canvas id="canvas"></canvas>
            </div>
        </div>
    );
};

export default Pixel;