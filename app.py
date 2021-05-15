from flask import *
import json
import mysql.connector
from decouple import config

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['JSON_SORT_KEYS'] = False
app.secret_key = config('secret_key')


mydb = mysql.connector.connect(
	host = 'localhost',
	user = config('userID'),
	password = config('password'),
	database = 'taipei_day_trip'
)
mycursor = mydb.cursor()


# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

# 登入/註冊設定
@app.route("/api/user", methods=['GET'])
def sign_get():
	if "email" in session:
		return jsonify(
			{"data":{
			"id": session["id"],
			"name": session["name"],
			"email": session["email"]
		}
	})
	else:
		return jsonify({"message": None})

@app.route("/api/user", methods=['POST'])
def	sign_post():
	try:
		data = request.get_json()
		name = data["name"]
		email = data["email"]
		password = data["password"]
		sql = f"select email from user where email='{email}' "
		mycursor.execute(sql)
		account = mycursor.fetchone()
		if account is None:
			sql = f"insert into user(name,email,password) values('{name}','{email}','{password}')"
			mycursor.execute(sql)
			mydb.commit()
			return jsonify({"ok": True})
		elif account[0] == email:
			return jsonify({"error": True, "message": "註冊失敗，Email已被使用過"}), 400
		else:
			return jsonify({"error": True, "message": "註冊失敗，重複的Email或其他原因"}), 400
	except:
		return jsonify({"error": True, "message": "伺服器內部錯誤"}),500

@app.route("/api/user", methods=['PATCH'])
def	sign_patch():
	try:
		data = request.get_json()
		email = data["email"]
		password = data["password"]
		sql = f"select id,name,email,password from user where email='{email}' and password='{password}'"
		mycursor.execute(sql)
		account = mycursor.fetchone()
		if account is None:
			return jsonify({"error": True, "message": "登入失敗，帳號或密碼錯誤或其他原因"}),400
		else:
			if account[3] == password:
				session["id"] = account[0]
				session["name"] = account[1]
				session["email"] = account[2]
				return jsonify({"ok": True})
	except:
		return jsonify({"error": True, "message": "伺服器內部錯誤"}),500

@app.route("/api/user", methods=['DELETE'])
def	sign_delete():
	session.pop("id", None)
	session.pop("name", None)
	session.pop("email", None)
	return jsonify({"ok": True})


# 取得景點資料列表
@app.route("/api/attractions")
def spot_list():
	try:
		page = int(request.args.get("page", 0))
		keyword = request.args.get("keyword", None)
		# 沒輸入keyword : 先計算資料總筆數，再顯示每頁12筆的資料　#
		if keyword == None:
			sql_count = "select count(*) from spots;"
			mycursor.execute(sql_count)
			count_page = mycursor.fetchone()
			# 計算總頁數
			all_page = count_page[0] // 12
			if page < all_page:
				next_page = page+1
			else:
				next_page = None

			# 建立景點列表
			spot_list = []
			sql_cur_data = f"select * from spots limit {page*12},12"
			mycursor.execute(sql_cur_data)
			results = mycursor.fetchall()
			for result in results:
				dic = {
					"id": result[0],
					"name": result[1],
					"category": result[2],
					"description": result[3],
					"address": result[4],
					"transport": result[5],
					"mrt": result[6],
					"latitude": result[7],
					"longitude": result[8],
					"images": result[9].split(",")
					}
				spot_list.append(dic)
			spot = {"nextPage":next_page, "data": spot_list}
			return jsonify(spot)

		# 有輸入keyword，顯示篩選後的景點 #
		else:
			sql = f"select * from spots where name like '%{keyword}%' or category like '%{keyword}%' or mrt like '%{keyword}%' "
			mycursor.execute(sql)
			results = mycursor.fetchall()
			all_page = len(results) // 12
			if page < all_page:
				next_page = page+1
			else:
				next_page = None

			spot_list = []
			for result in results:
				dic = {
					"id": result[0],
					"name": result[1],
					"category": result[2],
					"description": result[3],
					"address": result[4],
					"transport": result[5],
					"mrt": result[6],
					"latitude": result[7],
					"longitude": result[8],
					"images": result[9].split(",")
					}
				spot_list.append(dic)
			cur_first = page * 12
			cur_last = (page+1) * 12
			data = spot_list[cur_first:cur_last]
			spot = {"nextPage":next_page, "data":data}
			return jsonify(spot)
	except:
		server_err = {"error": True, "message": "伺服器內部錯誤"}
		return server_err, 500

# 根據景點編號取得景點資料
@app.route("/api/attraction/<attractionId>")
def attraction_id(attractionId):
	try:
		sql = f"select * from spots where id={attractionId}"
		mycursor.execute(sql)
		result = mycursor.fetchone()
		if result!=None:
			dic = {
				"id": result[0],
				"name": result[1],
				"category": result[2],
				"description": result[3],
				"address": result[4],
				"transport": result[5],
				"mrt": result[6],
				"latitude": result[7],
				"longitude": result[8],
				"images": result[9].split(",")
				}
			return jsonify({"data": dic})
		else:
			num_err = {"error": True, "message": "景點編號不正確"}
			return num_err, 400
	except:
		server_err = {"error": True, "message": "伺服器內部錯誤"}
		return server_err, 500

app.run(host="0.0.0.0", port=3000)