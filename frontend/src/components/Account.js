import React, {useState, useEffect} from "react";
import headLogo from '../lib/image/head.png';
import "./Account.css";
const SERVER_URL = "http://127.0.0.1:5000";

function History({ user }){
    const [page, setPage] = useState(1);
    const [showButton, setShowButton] = useState(true);
    const [picturesList, setPicturesList] = useState([]);

    const getHistory = async () => {
        fetch(SERVER_URL + "/profile", {
            method: "POST",
            body: JSON.stringify({"account":user.account, "password":user.password}),
            headers: {"Content-Type": "application/json",'Access-Control-Allow-Origin': '*'},
            credentials: "include",
        })
        .then(res => res.json())
        .then(data => {
            let msgObj = data;
            //console.log("获取数据",msgObj);

            if(msgObj.isConnected){
                setPicturesList(msgObj.pictures);
                setShowButton(false);
            }else{
                alert("获取数据失败:" + msgObj.message);
            }
        })
    }

    return(
        <div id="history">
            <h1 id="history-header">历史记录</h1>
            <div id="history-content">
                {/* {picturesList.length == 0 && <img key={0} src={headLogo} alt="historyImage"/>} */}
                {0+(page-1)*9 < picturesList.length ? <img key={0} src={'data:image/png;base64,' + picturesList[0+(page-1)*9]} alt="historyImage"/> : null}
                {1+(page-1)*9 < picturesList.length ? <img key={1} src={'data:image/png;base64,' + picturesList[1+(page-1)*9]} alt="historyImage"/> : null}
                {2+(page-1)*9 < picturesList.length ? <img key={2} src={'data:image/png;base64,' + picturesList[2+(page-1)*9]} alt="historyImage"/> : null}
                {3+(page-1)*9 < picturesList.length ? <img key={3} src={'data:image/png;base64,' + picturesList[3+(page-1)*9]} alt="historyImage"/> : null}
                {4+(page-1)*9 < picturesList.length ? <img key={4} src={'data:image/png;base64,' + picturesList[4+(page-1)*9]} alt="historyImage"/> : null}
                {5+(page-1)*9 < picturesList.length ? <img key={5} src={'data:image/png;base64,' + picturesList[5+(page-1)*9]} alt="historyImage"/> : null}
                {6+(page-1)*9 < picturesList.length ? <img key={6} src={'data:image/png;base64,' + picturesList[6+(page-1)*9]} alt="historyImage"/> : null}
                {7+(page-1)*9 < picturesList.length ? <img key={7} src={'data:image/png;base64,' + picturesList[7+(page-1)*9]} alt="historyImage"/> : null}
                {8+(page-1)*9 < picturesList.length ? <img key={8} src={'data:image/png;base64,' + picturesList[8+(page-1)*9]} alt="historyImage"/> : null}
            </div>
            <div id="history-footer">{showButton ? <a className="btn" onClick={getHistory}>显示图片</a> : (<span><button onClick={() => setPage(page-1>0?page-1:1)}>{'<'}</button> {`页数: ${page} / ${Math.ceil(picturesList.length/9)==0?1:Math.ceil(picturesList.length/9)}`} <button onClick={() => setPage(page+1<Math.ceil(picturesList.length/9)?page+1:Math.ceil(picturesList.length/9))}>{'>'}</button></span>)}</div>
        </div>
    )
}

function Login({ user, onHandleUser, onHandleUsernameChange, onHandlePasswordChange , onHandelHeadShowChange, onHandleAccountChange}){
    const [onSigninPage, setOnSigninPage] = useState(false);

    const handleLogin = () => {
        if(onSigninPage){
            setOnSigninPage(false);
            return;
        }

        console.log(user);
        fetch(SERVER_URL + "/login", {
                method: "POST",
                body: JSON.stringify({"account":user.account, "password":user.password}),
                headers: {"Content-Type": "application/json",'Access-Control-Allow-Origin': '*'},
            })
            .then(res => res.json())
            .then(data => {
                let jsonObj = data
                console.log("后端返回msg",jsonObj)

                if(jsonObj.login_success){
                    //登录成功，获取数据
                    fetch(SERVER_URL + "/profile", {
                        method: "POST",
                        body: JSON.stringify({"account":user.account, "password":user.password}),
                        headers: {"Content-Type": "application/json",'Access-Control-Allow-Origin': '*'},
                    })
                    .then(res => res.json())
                    .then(data => {
                        let msgObj = data;
                        console.log("获取数据",msgObj);

                        if(msgObj.isConnected){
                            onHandleUser(msgObj);
                            localStorage.setItem("user", JSON.stringify({...msgObj, pictures: []}));
                            
                        }else{
                            alert("获取数据失败:" + msgObj.message);
                        }
                    })
                }else{
                    //登录失败
                    alert("登陆失败:" + jsonObj.message);
                }
            })
    }
    const handleSignin = () => {
        if(!onSigninPage){
            setOnSigninPage(true);
            return;
        }

        fetch(SERVER_URL + "/signup", {
            method: "POST",
            body: JSON.stringify({"account":user.account, "password":user.password, "username":user.username, "headShow":user.headShow}),
            headers: {"Content-Type": "application/json",'Access-Control-Allow-Origin': '*'},
        })
        .then(res => res.json())
        .then(data => {
            let jsonObj = data;
            console.log("后端返回msg",jsonObj)

            if(jsonObj.signup_success){
                //注册成功
                onHandleUser({...user, isConnected: false});
                setOnSigninPage(false);
                alert("注册成功,请重新登录");
            }else{
                //注册失败
                alert("注册失败:" + jsonObj.message);
            }
        })
    }

    if(!onSigninPage)
    return (
        <div id="loginPage">
            <h2>登录</h2>
            <form>
                <div>
                    <label htmlFor="account">账 号: </label>
                    <input type="text" id="account" onChange={onHandleAccountChange} />
                </div>
                <div>
                    <label htmlFor="password">密 码: </label>
                    <input type="password" id="password" onChange={onHandlePasswordChange} />
                </div>
                <button type="button" onClick={handleLogin}>登录</button>
                <button type="button" onClick={handleSignin}>注册页面</button>
            </form>
        </div>
    )
    else
    return (
        <div id="signinPage">
            <h2>注册</h2>
            <form>
                <img id="previewHead" width="50px" height="50px" src="" alt="头像预览"></img>
                <div>
                    <label htmlFor="account">账 号: </label>
                    <input type="text" id="account" onChange={onHandleAccountChange} />
                </div>
                <div>
                    <label htmlFor="password">密 码: </label>
                    <input type="password" id="password" onChange={onHandlePasswordChange} />
                </div>
                <div>
                    <label htmlFor="username">昵 称: </label>
                    <input type="text" id="username" onChange={onHandleUsernameChange} />
                </div>
                <div>
                    <label htmlFor="head">头 像: </label>
                    <input type="file" id="head" accept="image/png,image/gif,image/jpeg" onChange={onHandelHeadShowChange}/>
                </div>
                <button type="button" onClick={handleLogin}>登录页面</button>
                <button type="button" onClick={handleSignin}>注册</button>
            </form>
        </div>
    )
}

function Account(){
    const [user, setUser] = useState({
        isConnected: false,
        username: "",
        account: "",
        password: "",
        headShow: headLogo,
        pictures: [],
    });

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem("user"));
        if(localUser){
            setUser(localUser);
        }
    },[])

    const handleUser = (u) => {
        setUser({...user, ...u});
    }

    const handleUsernameChange = (event) => {
        setUser({...user, username: event.target.value})
    }

    const handlePasswordChange = (event) => {
        setUser({...user, password: event.target.value})
    }

    const handleAccountChange = (event) => {
        setUser({...user, account: event.target.value})
        //console.log(user);
    }

    const handelHeadShowChange = (event) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            var base64String = ev.target.result;
            document.querySelector("#previewHead").src = base64String;
            //console.log(base64String);
            setUser({...user, headShow: base64String})
        }
        reader.readAsDataURL(event.target.files[0]);
    }

    return(
        <div id="Account">
            <div id="leftInformation">
                <h1 id="isLogin">{`状态: ${user.isConnected ? "已登录" : "未登录"}`}</h1>
                <img id="headShow" src={user.isConnected ? user.headShow : headLogo} alt="headShow of user"></img>
                <div id="userInformation">
                    <li>{`用户名:`}</li>
                    <li>{`${user.isConnected ? user.username : "(请先登录)"}`}</li>
                    <li>{`账号:`}</li>
                    <li>{`${user.isConnected ? user.account : "(请先登录)"}`}</li>
                    <li><a className="btn" onClick={() => {
                            setUser({
                                isConnected: false,
                                username: "",
                                account: "",
                                password: "",
                                headShow: headLogo,
                                pictures: [],
                            });
                            localStorage.setItem("user", JSON.stringify({
                                isConnected: false,
                                username: "",
                                account: "",
                                password: "",
                                headShow: headLogo,
                                pictures: [],
                            }));
                        }}>退出登录</a></li>
                </div>
                <div id="aboutList">
                    <ul>
                        <li><a href="https://github.com/Dandaxia7/pixel-art">发布网站</a></li>
                        <li>联系邮箱:</li>
                        <li>pengzq7@qq.com</li>
                    </ul>
                </div>
            </div>
            <div id="rightInformation">
                {user.isConnected ?
                    <History user={user} />
                    : <Login user={user} onHandleUser={handleUser} onHandleUsernameChange={handleUsernameChange} onHandlePasswordChange={handlePasswordChange} onHandleAccountChange={handleAccountChange} onHandelHeadShowChange={handelHeadShowChange} />}
            </div>
        </div>
    )
}

export default Account;