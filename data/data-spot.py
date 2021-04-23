import json
import mysql.connector
from decouple import config

mydb = mysql.connector.connect(
    host = 'localhost',
    user = config('userID',default=''),
    password = config('password',default=''),
    database = 'taipei_day_trip'
)
mycursor = mydb.cursor()

create_table = """create table spots(
    id int not null comment '景點編號',
    name varchar(45) not null comment '景點名稱',
    category varchar(45) not null comment '景點類別',
    description text not null comment '景點詳細',
    address varchar(255) not null comment '景點地址',
    transport text null comment '交通方式',
    mrt varchar(45) null comment '鄰近的捷運站',
    latitude float not null comment '緯度',
    longitude float not null comment '經度',
    images longtext not null comment '圖片網址')
    engine=InnoDB
    default character set =utf8;"""
mycursor.execute(create_table)

with open("taipei-attractions.json", mode = "r", encoding = "utf-8") as file:
    data = json.load(file)
    spot_list = data["result"]["results"]
    for spot in spot_list:
        photos = spot["file"].split("http")
        photos_url = ""
        for i in photos:
            if i and i[-3:] in ["jpg","png","JPG","PNG"]:
                photos_url = photos_url+"http"+i+","

        sql = "insert into spots(id, name, category, description, address, transport, mrt, latitude, longitude, images) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
        val = [
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
