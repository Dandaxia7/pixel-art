from flask import Flask, request, jsonify, redirect, url_for, session
from http import HTTPStatus
from urllib.parse import urlparse, unquote
from pathlib import PurePosixPath
import requests
import dashscope
from flask_cors import CORS  # 我的电脑这里为什么一直报错 好像找不到flask_cors这个包
import os
from base64 import b64encode
import pymysql  # 这个依赖是用来在python中执行相关sql语句的
from json import dumps
ENCODING = 'utf-8'


dashscope.api_key = "sk-143134c92b79430aa5e604499e8f3b93"  # 这是我注册的API密钥
app = Flask(__name__)  # 使用flask框架
CORS(app, supports_credentials=True)
app.secret_key = "mamba"

conn = pymysql.connect(
    user="el_project_mamba",
    password="ELproject2024mamba",
    host="rm-bp1sj56l045ivxi7g5o.mysql.rds.aliyuncs.com",
    database="el_project",
)  # 连接到我云端创建的sql数据库
cur = conn.cursor()  # 用于对连接到的数据库执行各种语句操作


@app.route("/api", methods=["POST"])  # rule部分更改成获取用户提示词的网站
def call_image_synthesis():  # 添加部分为记录该用户所生成过的图片
    if False and session.get("username") is None:
        return jsonify({'message': "Not logged in"})
    data = request.get_json()
    #print(data)
    prompt = data.get("prompt")  # 获取提示词
    n = data.get("n")  # 获取图片生成数量 && n = 1
    if not prompt or not n:
        return jsonify({'message': 'Please provide a prompt or exact amount.'}), HTTPStatus.BAD_REQUEST  # 提示词或图片生成数量出现错误

    rsp = dashscope.ImageSynthesis.call(model=dashscope.ImageSynthesis.Models.wanx_v1,
                                         prompt=prompt,
                                         n=n,
                                         size='1024*1024')  # 提交提示词与生成数量
    if rsp.status_code == HTTPStatus.OK:  # 检测正常生成
        results = {"name": "", "imageData": ""}
        for result in rsp.output.results:
            file_name = PurePosixPath(unquote(urlparse(result.url).path)).parts[-1]  # 解析获得的图片的路由并获取其文件名
            path = "./backend/Images"
            if not os.path.exists(path):
                os.makedirs(path)
            with open(path +'/%s' % file_name, 'wb+') as f:  # 这里可以先新建一个文件夹再保存 要不然会有点乱
                f.write(requests.get(result.url).content)  # 将获取到的图片保存至本地
            results["name"] = file_name # 记录获取到的文件名
            with open(path +'/%s' % file_name, 'rb') as f:
                byte_content = f.read()
                base64_bytes = b64encode(byte_content)
                base64_string = base64_bytes.decode(ENCODING)
                #username = session.get("username")
                username = data.get("username")
                sql = "SELECT * FROM information_schema.tables WHERE table_schema = 'el_project' AND table_name = '%s'" % (username)
                cur.execute(sql)
                conn.ping(reconnect=True)
                cur.execute(sql)
                conn.commit()
                res = cur.fetchall()
                if len(res) == 0:
                    sql = "CREATE TABLE %s (amount INT)" % (username)
                    conn.ping(reconnect=True)
                    cur.execute(sql)
                    conn.commit()
                    sql = "INSERT INTO %s(amount) VALUES (0)" % (username)
                    conn.ping(reconnect=True)
                    cur.execute(sql)
                    conn.commit()
                sql = "SELECT amount FROM %s " % (username)
                conn.ping(reconnect=True)
                cur.execute(sql)
                conn.commit()
                amount = cur.fetchall()[0][0] + 1
                sql = "ALTER TABLE %s ADD COLUMN %s LONGTEXT" % (username, "picture" + str(amount))
                conn.ping(reconnect=True)
                cur.execute(sql)
                conn.commit()
                # sql = "INSERT INTO %s(%s) VALUES ('%s')" % (username, "picture" + str(amount), base64_string)
                # conn.ping(reconnect=True)
                # cur.execute(sql)
                # conn.commit()
                sql = "UPDATE %s SET amount = amount + 1 , %s = '%s'" % (username, "picture" + str(amount), base64_string)
                conn.ping(reconnect=True)
                cur.execute(sql)
                conn.commit()
                results["imageData"] = base64_string  # 记录获取到的图片base64编码
            os.remove(path +'/%s' % file_name)  # 删除本地保存的图片
        return jsonify({"name": results["name"], "imageData": results["imageData"]}), HTTPStatus.OK  # 将所有生成的图片的文件名以json格式返回至前端
    else:
        return jsonify({'name': 'Failed to call image synthesis.'}), HTTPStatus.INTERNAL_SERVER_ERROR  # 检测到未正常生成





def allIsNull(username, password, account):  # 判断用户名以及密码是否为空
    if username == '' or password == '' or account == '':
        return True
    else:
        return False

def loginNull(account, password):
    if account == '' or password == '':
        return True
    else:
        return False


def passwordIsCorrect(account, password):  # 判断该用户名密码是否正确
    sql = "SELECT * FROM user WHERE account ='%s' and password ='%s'" % (account, password)
    conn.ping(reconnect=True)  # 保证与数据库连接正常 否则用多次后会断掉
    cur.execute(sql)
    conn.commit()
    result = cur.fetchall()
    if len(result) == 0:
        return False
    else:
        return True

def accountIsExisted(account):  # 判断该账号是否存在
    sql = "SELECT * FROM user WHERE account ='%s'" % (account)
    conn.ping(reconnect=True)
    cur.execute(sql)
    conn.commit()
    result = cur.fetchall()
    if len(result) == 0:
        return False
    else:
        return True

def usernameIsExisted(username):  # 判断该用户名是否存在
    sql = "SELECT * FROM user WHERE username ='%s'" % (username)
    conn.ping(reconnect=True)
    cur.execute(sql)
    conn.commit()
    result = cur.fetchall()
    if len(result) == 0:
        return False
    else:
        return True

def addUser(username, password, account, head):  # 像数据库中添加用户
    sql = "INSERT INTO user(username, account, password, head) VALUES ('%s', '%s', '%s', '%s')" % (username, account, password, head)
    cur.execute(sql)
    conn.commit()

def isLegal(username, password, account):  # 判断用户名密码账号的合法性
    if len(username) < 4:
        return "Username should contain at least 4 characters"

    if len(account) < 10:
        return "Account should contain at least 10 characters"
    if not account.isdigit():
        return "Account can only be composed of numbers"

    if len(password) < 8:
        return "Password should contain at least 8 characters"
    if not password.isalnum():
        return "Account can only be composed of numbers and alphas"

    return "All legal"

@app.route("/login", methods=["GET", "POST"])  # 方法有GET和POST 是为了直接搜索login的时候不会报错
def login():
    if request.method == "POST":
        data = request.get_json()
        account = data.get("account")
        password = data.get("password")

        if loginNull(account, password):
            return jsonify({"login_success": False, "message": "Account and password is necessary"})
        if not accountIsExisted(account):
            return jsonify({"login_success": False, "message": "This user is not existed. Please sign up first"})
        if not passwordIsCorrect(account, password):
            return jsonify({"login_success": False, "message": "Password is wrong"})

        sql = "SELECT * FROM user WHERE account ='%s'" % (account)
        conn.ping(reconnect=True)
        cur.execute(sql)
        conn.commit()
        result = cur.fetchall()
        username = result[0][0]
        session["username"] = username
        print(session["username"])
        return jsonify({"login_success": True, "message": "Log in successfully"})

@app.route("/session", methods=["GET"])  # 检查登陆状态
def checkSession():
    username = session.get("username")
    if username is None:
        return jsonify({"username": None, "logging": False})
    else:
        return jsonify({"username": username, "logging": True})

@app.route("/signup", methods=["POST", "GET"])
def signup():
    if request.method == "POST":
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        head = data.get("headShow")
        account = data.get("account")

        if allIsNull(username, password, account):
            return jsonify({"signup_success": False, "message": "Username, account and password are necessary"})
        if usernameIsExisted(username):
            return jsonify({"signup_success": False, "message": "Username is existed. Please change it"})
        if accountIsExisted(account):
            return jsonify({"signup_success": False, "message": "Account is existed. Please change it"})

        msg = isLegal(username, password, account)
        if msg == "All legal":
            addUser(username, password, account, head)
            return jsonify({"signup_success": True, "message": "Sign up successfully"})
        else:
            return jsonify({"signup_success": False, "message": msg})


@app.route("/profile", methods=["GET", "POST"])
def profile():
    print(session.get("username"))
    if False and session.get("username") is None:
        return jsonify({"message": "Not logged in", "isConnected": False})
    else:
        data = request.get_json()
        account = data.get("account")
        password = data.get("password")
        sql = "SELECT * from user where account = '%s'" % (account)
        conn.ping(reconnect=True)
        cur.execute(sql)
        conn.commit()
        result = cur.fetchall()
        username = result[0][0]
        account = result[0][1]
        password = result[0][2]
        head = result[0][3]

        sql = "SELECT * FROM information_schema.tables WHERE table_schema = 'el_project' AND table_name = '%s'" % (username)
        conn.ping(reconnect=True)
        cur.execute(sql)
        conn.commit()
        result = cur.fetchall()

        if len(result) != 0:
            sql = "SELECT * from %s " % (username)
            conn.ping(reconnect=True)
            cur.execute(sql)
            conn.commit()
            result = cur.fetchall()
            amount = result[0][0]
        else:
            amount = 0
        pics = []
        for i in range(amount):
            pics.append(result[0][i + 1])
        message = {"isConnected": True,"username": username, "account": account, "password": password,  "headShow": head, "pictures": pics}

        return jsonify(message)




app.run(host="0.0.0.0")  # 在任何设备上都可运行
