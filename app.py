from flask import *
import json
import mysql.connector
from decouple import config

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config['JSON_SORT_KEYS'] = False


mydb = mysql.connector.connect(
    host = 'localhost',
    user = config('userID',default=''),
    password = config('password',default=''),
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

# 取得景點資料列表
@app.route("/api/attractions")
def spot_list():
	try:
		page = int(request.args.get("page", 0))
		keyword = request.args.get("keyword", None)
		# 沒輸入keyword，顯示全部景點 #
		if keyword == None:
			sql = "select * from spots"
			mycursor.execute(sql)
			results = mycursor.fetchall()
			# 計算總頁數
			all_page = len(results) // 12
			if page < all_page:
				next_page = page+1
			else:
				next_page = None
			
			# 建立景點列表
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
					"images": [result[9]]
					}
				spot_list.append(dic)
			# 每頁顯示12個景點(第0頁:[0:12])
			cur_first = page * 12
			cur_last = (page+1) * 12
			data = spot_list[cur_first:cur_last]
			spot = {"nextPage":next_page, "data": data}
			return jsonify(spot), 200

		# 有輸入keyword，顯示篩選後的景點 #
		else:
			sql = f"select * from spots where name like '%{keyword}%' or category like '%{keyword}%' or description like '%{keyword}%'"
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
					"images": [result[9]]
					}
				spot_list.append(dic)
			cur_first = page * 12
			cur_last = (page+1) * 12
			data = spot_list[cur_first:cur_last]
			spot = {"nextPage":next_page, "data":data}
			return jsonify(spot), 200
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
				"images": [result[9]]
				}
			return jsonify({"data": dic}), 200
		else:
			num_err = {"error": True, "message": "景點編號不正確"}
			return num_err, 400
	except:
		server_err = {"error": True, "message": "伺服器內部錯誤"}
		return server_err, 500

app.run(host="0.0.0.0", port=3000)