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

// 顯示預定行程上方的招呼語
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
const checkBooking = ()=>{
  const no_booking_alert = document.getElementsByClassName("no_booking_alert")[0]
  const booking_section = document.getElementsByClassName("booking_section")[0]
  const photo = document.getElementsByClassName("photo")[0]
  const spot_name = document.getElementsByClassName("spot_name")[0]
  const date = document.getElementsByClassName("date")[0]
  const time = document.getElementsByClassName("time")[0]
  const price = document.getElementsByClassName("price")[0]
  const address = document.getElementsByClassName("address")[0]
  const total_price = document.getElementsByClassName("total_price")[0]
  let src = 'api/booking'
  fetch(src, { method: "GET" })
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
  })
  .catch(err=>console.log("error",err))
}
checkBooking()