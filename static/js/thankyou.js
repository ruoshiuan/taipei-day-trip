const number = location.search.split('=')[1]
const order_number = document.getElementById("order_number")
const photo = document.getElementsByClassName("photo")[0]
const spot_name = document.getElementsByClassName("spot_name")[0]
const date = document.getElementsByClassName("date")[0]
const time = document.getElementsByClassName("time")[0]
const price = document.getElementsByClassName("price")[0]
const address = document.getElementsByClassName("address")[0]
const contact_name = document.getElementById("contact_name")
const contact_email = document.getElementById("contact_email")
const contact_tel = document.getElementById("contact_tel")
let url = `/api/orders/${number}`
fetch(url,{method: "GET"})
    .then((res)=>{
        return res.json()
    })
    .then((result)=>{
        if(result["data"] !== null){
            order_number.textContent = number
            photo.style.backgroundImage = 'url(' + `${result["data"]["trip"]["attraction"]["image"]}` + ')'
            spot_name.textContent = result["data"]["trip"]["attraction"]["name"]
            date.textContent = result["data"]["trip"]["date"]
            if(result["data"]["trip"]["time"] === "morning"){
                time.textContent = "早上9點到下午4點"
            }else{
                time.textContent = "下午2點到晚上9點"
            }
            price.textContent = "新台幣 " + result["data"]["price"] + " 元"
            address.textContent = result["data"]["trip"]["attraction"]["address"]
            contact_name.textContent = result["data"]["contact"]["name"]
            contact_email.textContent = result["data"]["contact"]["email"]
            contact_tel.textContent = result["data"]["contact"]["phone"]
        }
    })
