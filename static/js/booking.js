// 點擊刪除鈕刪除預定行程
const icon_delete = document.getElementsByClassName("icon_delete")[0]
icon_delete.addEventListener('click',()=>{
  let src = '/api/booking'
  fetch(src,{method: "DELETE"})
    .then((res)=>{
      return res.json()
    })
    .then((result)=>{
      if(result["ok"]){
        document.location.pathname = '/booking'
      }
    })
    .catch((err)=>{
      console.log("error",err)
      })
})

// 顯示預定行程
const renderBooking = ()=>{
  const banner = document.getElementsByClassName("banner")[0]
  let src = '/api/user'
  fetch(src,{method: "GET"})
    .then((res)=>{
      return res.json()
    })
    .then((result)=>{
      if(banner){
        banner.textContent = '您好，' + `${result["data"]["name"]}` + '，待預訂的行程如下：'
      }
    })
}
renderBooking()

// 確認有無訂單：有->顯示詳細行程資訊；無->顯示沒有行程資訊
const no_booking_alert = document.getElementsByClassName("no_booking_alert")[0]
const booking_section = document.getElementsByClassName("booking_section")[0]
const photo = document.getElementsByClassName("photo")[0]
const spot_name = document.getElementsByClassName("spot_name")[0]
const date = document.getElementsByClassName("date")[0]
const time = document.getElementsByClassName("time")[0]
const price = document.getElementsByClassName("price")[0]
const address = document.getElementsByClassName("address")[0]
const total_price = document.getElementsByClassName("total_price")[0]
let trip;
const checkBooking = ()=>{
  fetch('api/booking', { method: "GET" })
  .then((res)=>{
    return res.json()
  })
  .then((result)=>{
    if(result["data"]!=null){
      no_booking_alert.style.display = "none"
      booking_section.style.display = "block"
      photo.style.backgroundImage = 'url(' + `${result["data"]["attraction"]["image"]}` + ')'
      spot_name.textContent = `台北一日遊：${result["data"]["attraction"]["name"]}`
      date.textContent = `${result["data"]["date"]}`
      if(result["data"]["time"] === "morning"){
        time.textContent = "早上9點到下午4點"
      }else{
        time.textContent = "下午2點到晚上9點"
      }
      price.textContent = `新台幣 ${result["data"]["price"]} 元`
      address.textContent = `${result["data"]["attraction"]["address"]}`
      total_price.textContent = `總價 新台幣${result["data"]["price"]} 元`
    }else{
      no_booking_alert.style.display = "block"
      booking_section.style.display = "none"
    }
    trip = {
      "attraction": {
        "id": result["data"]["attraction"]["id"],
        "name": result["data"]["attraction"]["name"],
        "address": result["data"]["attraction"]["address"],
        "image": result["data"]["attraction"]["image"]
      },
      "date":result["data"]["date"],
      "time": result["data"]["time"]
    }

  })
}
checkBooking();

TPDirect.setupSDK(20397, 'app_phjDu6oKgOKugtGNKMz4blVIjeXFlwLEqLSpi6k3GWJG2a7OsJKXuOsXafx9', 'sandbox')
const fields = {
  number: {
    element: '#card-number',
    placeholder: '**** **** **** ****'
  },
  expirationDate: {
    element: document.getElementById('card-expiration-date'),
    placeholder: 'MM / YY'
  },
  ccv: {
    element: '#card-ccv',
    placeholder: '卡片末三碼'
  }
}
TPDirect.card.setup({
  fields: fields,
  styles: {
    // style focus state
    ':focus': {
        'color': 'black'
    },
    // style valid state
    '.valid': {
        'color': 'green'
    },
    // style invalid state
    '.invalid': {
        'color': 'red'
    },
    // Media queries
    // Note that these apply to the iframe, not the root window.
    '@media screen and (max-width: 400px)': {
        'input': {
            'color': 'orange'
        }
    }
}
})

const confirm = document.getElementById("confirm")
const contact_name = document.getElementById("contact_name")
const contact_email = document.getElementById("contact_email")
const contact_tel = document.getElementById("contact_tel")
const error_alert = document.getElementById("error_alert")

confirm.addEventListener('click',(e)=>{
  e.preventDefault()
  const contact_name_verify = /^[\u4e00-\u9fa5]{2,12}$|^[a-zA-Z\s]{3,30}$/.test(contact_name.value)
  const signup_email_verify = /^\w+([\w\.\-]){1,63}\@\w+([\w\.\-])\.\w+([\w\.\-])$/.test(contact_email.value)
  const contact_tel_verify = /^09[0-9]{8}$/.test(contact_tel.value)
  if(contact_name.value === "" || contact_email.value === "" || contact_tel.value ===""){
    error_alert.textContent = "*尚有聯絡資訊未輸入"
  }else if (contact_name_verify === false){
    error_alert.textContent = "*請輸入正確的中文姓名或英文姓名"
  }else if (signup_email_verify === false){
    error_alert.textContent = "*信箱格式不正確"
  }else if (contact_tel_verify === false){
    error_alert.textContent = "*手機號碼格式不正確"
  }else{
  // 取得 TapPay Fields 的 status
  // Get prime
  TPDirect.card.getPrime((result) => {
    if (result.status !== 0) {
        console.log('get prime error ' + result.msg)
        error_alert.textContent = "*請輸入正確信用卡號"
        return
    }
    // alert('get prime 成功，prime: ' + result.card.prime)
    error_alert.textContent = ""
    let order_data = {
      "prime": result.card.prime,
      "order":{
        "price": parseInt(price.textContent.replace(/[^0-9]/ig,"")),
        "trip": trip,
        "contact": {
          "name": contact_name.value,
          "email": contact_email.value,
          "phone": contact_tel.value
        }
      }
    }
    // 傳送prime和預定資訊到後端
    fetch('/api/orders',{
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(order_data)
    })
      .then((res)=>{
        return res.json()
      })
      .then((result)=>{
        if(result["data"]!=null){
          const query = result["data"]["number"]
          const url = "/thankyou?number=" + query
          window.location.replace(url)
          remove_history()
        }
      })
    })
  }
})

// 付款完成，清除預定行程頁面的資料
const remove_history = ()=>{
  let src = '/api/booking'
  fetch(src,{method: "DELETE"})
    .then((res)=>{
      return res.json()
    })
    .then((result)=>{
      if(result["ok"]){
        return result["ok"]
      }
    })
    .catch((err)=>{
      console.log("error",err)
      })
}