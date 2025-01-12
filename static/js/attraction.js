const attrId = location.pathname.split('/')[2]
const attractionId = attrId

const morning = document.getElementById("morning")
const afternoon = document.getElementById("afternoon")
const price = document.getElementById("price")

const left_button = document.getElementsByClassName("fa-chevron-circle-left")[0]
const right_button = document.getElementsByClassName("fa-chevron-circle-right")[0]
const balls = document.getElementsByClassName("balls")[0]

const spot_title = document.getElementsByClassName("spot_title")[0]
const spot_subtitle = document.getElementsByClassName("spot_subtitle")[0]
const spot_img = document.getElementsByClassName("spot_img")[0]
const spot_description = document.getElementsByClassName("description")[0]
const spot_address = document.getElementsByClassName("address")[0]
const spot_way = document.getElementsByClassName("way")[0]

// 開始預定行程
const start_booking = document.getElementById("start_booking")
start_booking.addEventListener('click',(e)=>{
    e.preventDefault()
    let src = '/api/user'
    fetch(src,{method: "GET"})
      .then((res)=>{
        return res.json()
      })
      .then((result)=>{
        if(result["data"]!=null){
            create_booking_info()
        }else{
            login_form.style.display = "block"
            black_background.style.display = "block"
            login_form.style.animation="render_move 1s ease"
            black_background.style.display = "render_move 1s ease"
        }
      }).catch(err=>console.log(err))
})


const create_booking_info = ()=>{
    const date_value = document.getElementById("date").value
    const time_value = document.querySelector("[class=radio_input]:checked").value
    const price_value = parseInt(price.textContent.replace(/[^0-9]/ig,""))
    let src = '/api/booking'
    fetch(src,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            "attractionId": attrId,
            "date": date_value,
            "time": time_value,
            "price": price_value
          })
    })
    .then((res)=>{
        return res.json()
    })
    .then((result)=>{
        if(result["ok"]){
            document.location.pathname='/booking'

        }else{
            document.getElementsByClassName("select_date_alert")[0].style.display = "block"
            document.getElementsByClassName("select_date_alert")[0].style.color = "#f24"
        }
    })
    .catch(err=>(console.log(err)))
}

// 取得資料 初始畫面
const init = ()=>{
    let src=`/api/attraction/${attractionId}`
    fetch(src)
        .then((res)=>{
            return res.json()
        }).then((result)=>{
            let data = result.data
            renderSpot(data)
            clickButtonRight(data)
            clickButtonLeft(data)
            createBalls(data)
            balls.childNodes[0].style.backgroundColor = "white"
            switchBall(data)
            priceSwitch()
        }).catch((err)=>{
            console.log(err)
    })
}
init();

// 顯示景點資訊
const renderSpot = (data)=>{
    const name = data.name
    const category = data.category
    const description = data.description
    const address = data.address
    const mrt = data.mrt
    const images = data.images[0]
    const transport = data.transport

    spot_title.textContent = name
    spot_img.style.backgroundImage = 'url(' + images + ')'
    spot_description.textContent = description
    spot_address.textContent = address
    spot_way.textContent = transport

    if(mrt == null){
        spot_subtitle.textContent = category
    }else if(category == "其　　他"){
        spot_subtitle.textContent = '其他類別'+' at '+ mrt
    }else{
        spot_subtitle.textContent = category +' at '+ mrt
    }
}

// 顯示今天以後的日曆
const setTodaysDate = ()=>{
    let today = new Date().toISOString().split('T')[0];
    document.getElementById("date").setAttribute('min', today);
}
setTodaysDate()

// 價格切換
const priceSwitch = ()=>{
    morning.addEventListener('click',()=>{
        price.textContent = "新台幣 2000 元"
    })
    afternoon.addEventListener('click',()=>{
        price.textContent = "新台幣 2500 元"
    })
}

// 點擊右按鈕切換圖片
const clickButtonRight = (data)=>{
    const images_arr = data.images
    let i = 0
    right_button.addEventListener('click',()=>{
        i+=1;
        requestAnimation()
        if(i > images_arr.length-1){i = 0}
        spot_img.style.backgroundImage = 'url(' + images_arr[i] + ')'
        for(let x=0;x<images_arr.length;x++){
            if(i==x){
                notSelected()
                balls.childNodes[x].style.backgroundColor = "white"
            }else{
                balls.childNodes[x].style.backgroundColor = "black"
            }
        }
    })
}
// 點擊左按鈕切換圖片
const clickButtonLeft = (data)=>{
    const images_arr = data.images
    let i = 0
    left_button.addEventListener('click',()=>{
        i-=1;
        requestAnimation()
        if(i < 0){i = images_arr.length-1}
        spot_img.style.backgroundImage = 'url(' + images_arr[i] + ')'
        for(let x=0;x<images_arr.length;x++){
            if(i==x){
                notSelected()
                balls.childNodes[x].style.backgroundColor = "white"
            }else{
                balls.childNodes[x].style.backgroundColor = "black"
            }
        }
    })
}

// 輪播切換效果:reset+執行
const requestAnimation = ()=>{
    spot_img.style.animation = "none"
    window.requestAnimationFrame(()=>{
        spot_img.style.animation = "fadein 0.5s ease"
    })
}

// 製造輪播球
const createBalls = (data)=>{
    const images_arr = data.images
    for(let image of images_arr){
        const ball = document.createElement("div")
        ball.setAttribute("class","ball")
        balls.appendChild(ball)
    }
}
// 未被選到的輪播球是黑色
const notSelected = ()=>{
    balls.childNodes.forEach(otherball=>{
        otherball.style.backgroundColor = "black"
    })
}
// 點選輪播球移動至照片位置
const switchBall = (data)=>{
    const images_arr = data.images
    for(let n=0;n<images_arr.length;n++){
        balls.childNodes[n].addEventListener('click',()=>{
            requestAnimation()
            notSelected()
            spot_img.style.backgroundImage = 'url(' + images_arr[n] + ')'
            balls.childNodes[n].style.backgroundColor = "white"
        })
    }
}
