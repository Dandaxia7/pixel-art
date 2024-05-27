import React, {useState, useEffect} from "react";
import "./Canvas.css";

const boxSize = 30;

function Canvas(){

  const [ctxVal, setCtxVal] = useState(null);
  const [recentColor, setRecentColor] = useState({'r':255, 'g':255, 'b':255, 'a':1});
  const [recordColor, setRecordColor] = useState({'r':255, 'g':255, 'b':255, 'a':1});
  const [color, setColor] = useState({'r':255, 'g':255, 'b':255, 'a':1});
  const [scale, setScale] = useState(1);
  const [pageSlicePos, setPageSlicePos] = useState({x: 0, y: 0});
  const [solidColor] = useState('#CCCCCC80'); // 实线颜色
  const [dashedColor] = useState('#CCCCCC50'); // 虚线颜色
  const [zeroColor] = useState('rgb(0,0,0,0.6)'); // 0 点坐标系颜色
  const [pixels, setPixels] = useState(JSON.parse(localStorage.getItem('pixels')) || []);
  const [showLineGrid, setShowLineGrid] = useState(true);
  const [mouseDownFlag, setMouseDownFlag] = useState(false);

  useEffect(()=>{
    renderCanvas();
  },[pixels, scale, showLineGrid]);

  useEffect(()=>{
    setRecentColor(recordColor);
  },[color])

  useEffect(()=>{
    setRecordColor(color);
  },[pixels])

  const clearCanvas = () => {
    const canvas = document.getElementById('drawCanvas');
    if (canvas === null) return;
    const ctx = canvas.getContext('2d');
    //清除画布
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawLineGrid();
    //清除存储
    setPixels([]);
    //console.log(pixels);
    localStorage.setItem('pixels', JSON.stringify([]));
    setPageSlicePos({x: 0, y: 0});
  }

  const renderCanvas = () => {
    const gridSize = boxSize * scale;

    const canvas = document.getElementById('drawCanvas');
    if (canvas === null) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // 画网格
    if(showLineGrid){
      drawLineGrid();
    }
    
    //根据localStorage中的数据渲染画布
    const localPixels = JSON.parse(localStorage.getItem('pixels'));
    // for(let item in localPixels){
    //   ctx.fillStyle = item.color;
    //   ctx.fillRect(item.x * gridSize, item.y * gridSize, gridSize, gridSize);
    // }
    for(let i=0;i<(localPixels?localPixels.length:0);i++){
      ctx.fillStyle = localPixels[i].color;
      ctx.fillRect(localPixels[i].x * gridSize, localPixels[i].y * gridSize, gridSize, gridSize);
    }

    //绑定下载按钮
    var downloadBtn = document.querySelector("#download");
    downloadBtn.download = 'pixel.png';
    downloadBtn.href = canvas.toDataURL();
  }

  const drawLineGrid = (scaleVal = scale) => {
    const canvas = document.getElementById('drawCanvas');
    const ctx = ctxVal || canvas.getContext('2d');
    setCtxVal(ctx);
    //网格大小
    var gridSize = boxSize * scaleVal;
    //获取canvas宽高
    var CanvasWidth = ctx.canvas.width;
    var CanvasHeight = ctx.canvas.height;

    const canvasXHeight = CanvasHeight - pageSlicePos.y;
    const canvasYWidth = CanvasWidth - pageSlicePos.x;
    
    // 从 pageSlicePos.y 处开始往 Y 轴正方向画 X 轴网格
    const xPageSliceTotal = Math.ceil(canvasXHeight / gridSize);
    for (let i = 0; i < xPageSliceTotal; i++) {
        ctx.beginPath(); // 开启路径，设置不同的样式
        ctx.moveTo(0, pageSlicePos.y + gridSize * i);
        ctx.lineTo(CanvasWidth, pageSlicePos.y + gridSize * i);
        ctx.strokeStyle = i === 0 ? zeroColor : (i % 5 === 0 ? solidColor : dashedColor); // 如果为 0 则用粗线标记，取余 5 为实线，其余为比较淡的线
        ctx.stroke();
    }
    // // 从 pageSlicePos.y 处开始往 Y 轴负方向画 X 轴网格
    // const xRemaining = pageSlicePos.y;
    // const xRemainingTotal = Math.ceil(xRemaining / gridSize);
    // for (let i = 0; i < xRemainingTotal; i++) {
    //     if (i === 0) continue;
    //     ctx.beginPath(); // 开启路径，设置不同的样式
    //     ctx.moveTo(0, pageSlicePos.y - gridSize * i); // -0.5是为了解决像素模糊问题
    //     ctx.lineTo(CanvasWidth, pageSlicePos.y - gridSize * i);
    //     ctx.strokeStyle = i === 0 ? zeroColor : (i % 5 === 0 ? solidColor : dashedColor);// 如果为 0 则用蓝色标记，取余 5 为实线，其余为比较淡的线
    //     ctx.stroke();
    // }
    // 从 pageSlicePos.x 处开始往 X 轴正方向画 Y 轴网格
    const yPageSliceTotal = Math.ceil(canvasYWidth / gridSize); // 计算需要绘画y轴的条数
    for (let j = 0; j < yPageSliceTotal; j++) {
        ctx.beginPath(); // 开启路径，设置不同的样式
        ctx.moveTo(pageSlicePos.x + gridSize * j, 0);
        ctx.lineTo(pageSlicePos.x + gridSize * j, CanvasHeight);
        ctx.strokeStyle = j === 0 ? zeroColor : (j % 5 === 0 ? solidColor : dashedColor);// 如果为 0 则用蓝色标记，取余 5 为实线，其余为比较淡的线
        ctx.stroke();
    }
    // // 从 pageSlicePos.x 处开始往 X 轴负方向画 Y 轴网格
    // const yRemaining = pageSlicePos.x;
    // const yRemainingTotal = Math.ceil(yRemaining / gridSize);
    // for (let j = 0; j < yRemainingTotal; j++) {
    //     if (j === 0) continue;
    //     ctx.beginPath(); // 开启路径，设置不同的样式
    //     ctx.moveTo(pageSlicePos.x - gridSize * j, 0);
    //     ctx.lineTo(pageSlicePos.x - gridSize * j, CanvasHeight);
    //     ctx.strokeStyle = j === 0 ? zeroColor : (j % 5 === 0 ? solidColor : dashedColor);// 如果为 0 则用蓝色标记，取余 5 为实线，其余为比较淡的线
    //     ctx.stroke();
    // }
  };

  const mouseMove = (e) => {
    // const downX = e.clientX;
    // const downY = e.clientY;
    // const { x, y } = pageSlicePos;
    // const myCanvas = document.querySelector('#drawCanvas');
    // myCanvas.onmousemove = (ev) => {
    //     const moveX = ev.clientX;
    //     const moveY = ev.clientY;
    //     setPageSlicePos({
    //         x: x + (moveX - downX),
    //         y: y + (moveY - downY),
    //     });
    //     myCanvas.onmouseup = (en) => {
    //         myCanvas.onmousemove = null;
    //         myCanvas.onmouseup = null;
    //     };
    // }
    // myCanvas.onmouseup = (en) => {
    //     myCanvas.onmousemove = null;
    //     myCanvas.onmouseup = null;
    // };
    if(!mouseDownFlag) return;

    const downX = e.clientX - 335;
    const downY = e.clientY - 75;

    const gridSize = boxSize * scale;

    const x = Math.floor(downX / gridSize);
    const y = Math.floor(downY / gridSize);

    setPixels([...pixels, { x, y, "color": `rgba(${color['r']},${color['g']},${color['b']},${color['a']})` }]);
    //console.log(pixels);
    localStorage.setItem('pixels', JSON.stringify([...pixels, { x, y, "color": `rgba(${color['r']},${color['g']},${color['b']},${color['a']})` }]));
    
    // const myCanvas = document.querySelector('#drawCanvas');
    // myCanvas.onmousemove = (ev) => {
    //     const moveX = ev.clientX - 335;
    //     const moveY = ev.clientY - 75;
    //     const moveXGrid = Math.floor(moveX / gridSize);
    //     const moveYGrid = Math.floor(moveY / gridSize);
    // }
    const myCanvas = document.querySelector('#drawCanvas');
    myCanvas.onmouseup = () => {setMouseDownFlag(false);}
  }

  const mouseDown = (e) => {

    const downX = e.clientX - 335;
    const downY = e.clientY - 75;

    const gridSize = boxSize * scale;

    const x = Math.floor(downX / gridSize);
    const y = Math.floor(downY / gridSize);

    setPixels([...pixels, { x, y, "color": `rgba(${color['r']},${color['g']},${color['b']},${color['a']})` }]);
    //console.log(pixels);
    localStorage.setItem('pixels', JSON.stringify([...pixels, { x, y, "color": `rgba(${color['r']},${color['g']},${color['b']},${color['a']})` }]));
  }

  const clickColor = (e) => {
    const rgb = e.target.style.backgroundColor.match(/\d+/g);
    setColor({ "r": rgb[0], "g": rgb[1], "b": rgb[2], "a": 1 });
  }

  return (
    <div id="webCanvas">
      <div className="toolBar">
        <h1>画板</h1>
        <div id="colorPicker">
          <div id="quickColors">
            <div style={{backgroundColor:'rgba(255,0,0,1)'}} onClick={clickColor}></div>
            <div style={{backgroundColor:'rgba(0,255,0,1)'}} onClick={clickColor}></div>
            <div style={{backgroundColor:'rgba(0,0,255,1)'}} onClick={clickColor}></div>
            <div style={{backgroundColor:'rgba(255,255,255,1)'}} onClick={clickColor}></div>
            <div style={{backgroundColor:`rgba(${recentColor['r']},${recentColor['g']},${recentColor['b']},${recentColor['a']})`}} onClick={clickColor}></div>
            </div>
          <div id="colorDisplay" style={{backgroundColor:`rgba(${color['r']},${color['g']},${color['b']},${color['a']})`}}></div>
          <div id='rgbColor'>
            <span>R:<input type="range" min="0" max="255" step="1" name="r" value={color['r']} onChange={(e)=>{setColor({...color, 'r':e.target.value})}} /></span>
            <span>G:<input type="range" min="0" max="255" step="1" name="g" value={color['g']} onChange={(e)=>{setColor({...color, 'g':e.target.value})}} /></span>
            <span>B:<input type="range" min="0" max="255" step="1" name="b" value={color['b']} onChange={(e)=>{setColor({...color, 'b':e.target.value})}} /></span>
            <span>A:<input type="range" min="0" max="1" step="0.01" name="a" value={color['a']} onChange={(e)=>{setColor({...color, 'a':e.target.value})}} /></span>
            <span>rgba({color['r']},{color['g']},{color['b']},{color['a']})</span>
          </div>
        </div>
        <span>缩放<input type="range" min="0.3" max="3" step="0.1" name="scale" value={scale} onChange={(e)=>{setScale(e.target.value);ctxVal.clearRect(0, 0, ctxVal.canvas.width, ctxVal.canvas.height);drawLineGrid(scale);}} /></span>
        <a className="btn btn-download" onClick={clearCanvas}>清除画布</a>
        <a className="btn btn-download" onClick={()=>{setShowLineGrid(!showLineGrid)}}>{showLineGrid ? "隐藏网格" : "显示网格"}</a>
        <a id="download" className="btn btn-download">下载图片</a>
      </div>

      <div className="bodyBar">
        <canvas id="drawCanvas" width='1360' height='850' onMouseDown={(e)=>{setMouseDownFlag(true);mouseDown(e)}} onMouseMove={mouseMove}>
        </canvas>
      </div>
    </div>
  );
}

export default Canvas;