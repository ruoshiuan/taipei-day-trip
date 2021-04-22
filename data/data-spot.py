import json
import mysql.connector

mydb=mysql.connector.connect(
    host='localhost',
    user=user,
    password=password,
    database='taipei_day_trip'
)
mycursor=mydb.cursor()

with open("taipei-attractions.json", mode="r", encoding="utf-8") as file:
    data=json.load(file)
    spot_list=data["result"]["results"]
    for spot in spot_list:
        photos=spot["file"].split("http")
        photos_url=""
        for i in photos:
            if i and i[-3:] in ["jpg","png","JPG","PNG"]:
                photos_url=photos_url+"http"+i+","

        sql="insert into spot(id, name, category, description, address, transport, mrt, latitude, longitude, images) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
        val=[
            spot["_id"],
            spot["stitle"],
            spot["CAT2"],
            spot["xbody"],
            spot["address"],
            spot["info"],
            spot["MRT"],
            spot["latitude"],
            spot["longitude"],
            photos_url[:-1]
            ]
        mycursor.execute(sql, val)
        mydb.commit()