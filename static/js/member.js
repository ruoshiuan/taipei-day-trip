// 顯示訂單記錄
const order_history = document.getElementsByClassName("order_history")[0]
const history_alert = document.getElementsByClassName("history_alert")[0]
let url = "/api/member"
fetch(url, { method: "GET" })
    .then((res)=>{
        return res.json()
    })
    .then((result)=>{
        if(result["data"] !== null){
            const order_rows = result["data"]
            if (order_rows.length !== 0){
                for(let row of order_rows){
                    const number = row.orderNumber
                    const price = row.price
                    const name = row.name
                    const date = row.date
                    const order_time = row.orderTime

                    const content = document.createElement("ul")
                    content.className = "content"
                    order_history.appendChild(content)
                    const order_set = document.createElement("li")
                    order_set.className = "orderinfo"
                    order_set.id = "order_set"
                    order_set.textContent = order_time + " 完成"
                    content.appendChild(order_set)

                    const order_number = document.createElement("li")
                    order_number.className = "orderinfo"
                    order_number.id = "order_number"
                    order_number.textContent = "訂單編號："
                    content.appendChild(order_number)
                    const num = document.createElement("a")
                    num.setAttribute("class","num")
                    num.textContent = number
                    let source = "/thankyou?number="+number
                    num.setAttribute("href",source)
                    num.setAttribute("title","訂單歷史頁面")
                    order_number.appendChild(num)

                    const trip_name = document.createElement("li")
                    trip_name.className = "orderinfo"
                    trip_name.id = "trip_name"
                    trip_name.textContent = "行程：" + name
                    content.appendChild(trip_name)

                    const trip_date = document.createElement("li")
                    trip_date.className = "orderinfo"
                    trip_date.id = "trip_date"
                    trip_date.textContent = "出發日期：" + date
                    content.appendChild(trip_date)

                    const trip_price = document.createElement("li")
                    trip_price.className = "orderinfo"
                    trip_price.id = "trip_price"
                    trip_price.textContent = "費用：" + price + "元"
                    content.appendChild(trip_price)
                }
            }
        }
        else{
            const history_alert = document.createElement("p")
            history_alert.className = "history_alert"
            history_alert.textContent = "目前沒有任何訂購紀錄。"
            document.getElementsByTagName("section")[0].appendChild(history_alert)
        }
    })
    .catch((err)=>{
        console.log("error",err)
        })
