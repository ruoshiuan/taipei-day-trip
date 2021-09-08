from flask import *
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from decouple import config
import json
import requests
import random
import time

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['JSON_SORT_KEYS'] = False
app.secret_key = config('secret_key')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{config('userID')}:{config('password')}@localhost/taipei_day_trip"
db = SQLAlchemy(app)
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
# member Pages
@app.route("/member")
def member():
	return render_template("member.html")

# 會員頁面(歷史訂單查詢)
@app.route("/api/member", methods=['GET'])
def member_get():
	if "email" not in session:
		return jsonify({"error": True, "message": "尚未登入系統"}), 403
	else:
		memberId = session["id"]
		history_list = []
		sql = f"select orderNumber,price,spotName,date,orderTime from orders where memberId = '{memberId}' order by orderTime desc"
		results = db.engine.execute(sql).fetchall()
		if results == []:
			history_info = { "data": None }
			return jsonify(history_info)
		else:
			for result in results:
				history_info = {
					"orderNumber": result[0],
					"price": result[1],
					"name": result[2],
					"date": result[3],
					"orderTime": result[4].strftime('%Y-%m-%d %H:%M:%S')
				}
				history_list.append(history_info)
			order_history = history_list[0:len(results)]
			data = {"data": order_history}
			return jsonify(data)

# 訂單付款
@app.route("/api/orders", methods=['POST'])
def orders_post():
	if "email" not in session:
		return jsonify({"error": True, "message": "尚未登入系統"}), 403
	data = request.get_json()
	name = data["order"]["contact"]["name"]
	email = data["order"]["contact"]["email"]
	phone = data["order"]["contact"]["phone"]
	prime = data["prime"]
	trip_name = data["order"]["trip"]["attraction"]["name"]
	trip_date = data["order"]["trip"]["date"]
	trip_time = data["order"]["trip"]["time"]
	price = data["order"]["price"]
	if not name or not email or not phone:
		return jsonify({"error": True, "message": "尚有資料未輸入"}), 400
	else:
		headers = {
			"Content-Type": "application/json",
			"x-api-key": config('partner_key')
			}
		verify_data = {
			"prime": prime,
			"partner_key": config('partner_key'),
			"merchant_id": "rsw0524_CTBC",
			"order_number": f"{time.strftime('%Y%m%d', time.localtime())}{str(random.randint(100000,999999))}",
			"details": f"訂購項目:{trip_name},{trip_date},{trip_time}",
			"amount": price,
			"cardholder": {
				"phone_number": phone,
				"name": name,
				"email": email,
				"zip_code": "100",
				"address": "台北市天龍區芝麻街1號1樓",
				"national_id": "A123456789"
			}
		}
		# Pay by Prime to TapPay Server & get TapPay result
		response = requests.post("https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime", data = json.dumps(verify_data), headers = headers)
		response_json = response.json()
		if response_json['status'] == 0:
			return jsonify({
				"data": {
					"number": response_json['order_number'],
					"payment": {
					"status": "已付款",
					"message": "付款成功"
					}
				}
			})
		else:
			return jsonify({
				"data": {
					"number": response_json['order_number'],
					"payment": {
					"status": "未付款",
					"message": "付款失敗"
					}
				}
			})
@app.route("/api/orders/<orderNumber>", methods=['GET'])
def orders_get(orderNumber):
	if "email" not in session:
		return jsonify({"error": True, "message": "尚未登入系統"}), 403
	else:
		#response the record
		headers = {
			"Content-Type": "application/json",
			"x-api-key": config('partner_key')
		}
		record_data = {
			"partner_key": config('partner_key'),
			"filters": {
				"order_number": orderNumber
			}
		}
		response = requests.post("https://sandbox.tappaysdk.com/tpc/transaction/query", data = json.dumps(record_data), headers = headers)
		data = response.json()
		order_number = data["trade_records"][0]["order_number"]
		record_status = data["trade_records"][0]["record_status"]
		spot_name = data["trade_records"][0]["details"].split(',')[0].split(":")[1]
		date = data["trade_records"][0]["details"].split(',')[1]
		time = data["trade_records"][0]["details"].split(',')[2]
		price = data["trade_records"][0]["amount"]
		contact_name = data["trade_records"][0]["cardholder"]["name"]
		contact_email = data["trade_records"][0]["cardholder"]["email"]
		contact_phone = data["trade_records"][0]["cardholder"]["phone_number"]
		sql = f"select id,name,address,images from spots where name = '{spot_name}'"
		result = db.engine.execute(sql).fetchone()
		attraction = {
			"id": result[0],
			"name": result[1],
			"address": result[2],
			"image": result[3].split(",")[0]
		}
		attractionId = attraction["id"]
		spotName = attraction["name"]
		address = attraction["address"]
		image = attraction["image"]
		memberId = session["id"]
		description = {
				"number": order_number,
				"price": price,
				"trip": {
				"attraction": attraction,
				"date": date,
				"time": time
				},
				"contact": {
				"name": contact_name,
				"email": contact_email,
				"phone": contact_phone
				},
				"status": 1
		}
		if record_status == 0:
			status = 1
			sql = f"select memberId and orderNumber from orders where memberId = '{memberId}' and orderNumber = '{order_number}'"
			value = db.engine.execute(sql).fetchone()
			if value != None:
				return jsonify({"data": description})
			else:
				sql = f"insert into orders (orderNumber, memberId, price, attractionId, spotName, address, image, date, time, name, email, phone, status) VALUES ('{order_number}','{memberId}', '{price}', '{attractionId}', '{spotName}', '{address}', '{image}', '{date}', '{time}', '{contact_name}', '{contact_email}', '{contact_phone}', '{status}')"
				db.engine.execute(sql)
				return jsonify({"data": description})

# 預定行程
@app.route("/api/booking", methods=['GET'])
def booking_get():
	if "email" not in session:
		return jsonify({"error": True, "message": "尚未登入系統"}), 403
	else:
		sql="select attractionId,name,address,images,date,time,price from booking inner join spots on booking.attractionId = spots.id"
		result = db.engine.execute(sql).fetchone()
		if result is None:
			booking_info = {"data": None}
			return jsonify(booking_info)
		else:
			booking_info = {
				"data":{
					"attraction": {
						"id": result[0],
						"name": result[1],
						"address": result[2],
						"image": result[3].split(",")[0]
					},
					"date": result[4],
					"time": result[5],
					"price": result[6]
				}
			}
			return jsonify(booking_info)
@app.route("/api/booking", methods=['POST'])
def booking_post():
	try:
		if "email" not in session:
			return jsonify({"error": True, "message": "尚未登入系統"}), 403
		else:
			data = request.get_json()
			attractionId = data.get("attractionId")
			date = data.get("date")
			time = data.get("time")
			price = data.get("price")
			if date == "" or time == "":
				return jsonify({"error": True, "message": "請選擇日期或時間"}), 400
			else:
				sql = f"select * from booking"
				result = db.engine.execute(sql).fetchone()
				if result != None:
					sql = f"update booking set attractionId='{attractionId}',date='{date}',time='{time}',price='{price}'"
					db.engine.execute(sql)
					return jsonify({"ok": True})
				else:
					sql = f"insert into booking(attractionId,date,time,price) values ('{attractionId}','{date}','{time}','{price}')"
					db.engine.execute(sql)
					return jsonify({"ok": True})
	except:
		return jsonify({"error": True, "message": "伺服器內部錯誤"}), 500
@app.route("/api/booking", methods=['DELETE'])
def booking_delete():
	if "email" not in session:
		return jsonify({"error": True, "message": "尚未登入系統"}), 403
	else:
		sql = "delete from booking"
		db.engine.execute(sql)
		return jsonify({"ok": True})


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
		return jsonify({"data": None})

@app.route("/api/user", methods=['POST'])
def	sign_post():
	try:
		data = request.get_json()
		name = data["name"]
		email = data["email"]
		password = data["password"]
		sql = f"select email from user where email='{email}' "
		account = db.engine.execute(sql).fetchone()
		if account is None:
			sql = f"insert into user(name,email,password) values('{name}','{email}','{password}')"
			db.engine.execute(sql)
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
		sql = f"select memberId,name,email,password from user where email='{email}' and password='{password}'"
		account = db.engine.execute(sql).fetchone()
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
			sql = "select count(*) from spots"
			count_page = db.engine.execute(sql).fetchone()
			# 計算總頁數
			all_page = count_page[0] // 12
			if page < all_page:
				next_page = page+1
			else:
				next_page = None
			# 建立景點列表
			spot_list = []
			sql = f"select * from spots limit {page*12},12"
			results = db.engine.execute(sql).fetchall()
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
			sql = """select * from spots where name like '%' :keyword '%' or category like '%' :keyword '%' or mrt like '%' :keyword '%' """
			results = db.engine.execute(text(sql), {"keyword": keyword}).fetchall()
			all_page = len(results) // 12
			if page < all_page:
				next_page = page + 1
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
		result = db.engine.execute(sql).fetchone()
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