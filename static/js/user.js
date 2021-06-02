const container = document.getElementsByClassName("container")[0]
const login = document.getElementById("login")
const logout = document.getElementById("logout")
const black_background = document.getElementsByClassName("black_background")[0]

const login_form = document.getElementsByClassName("login_form")[0]
const login_email = document.getElementById("login_email")
const login_password = document.getElementById("login_password")
const login_msg = document.getElementsByClassName("login_msg")[0]

const signup_form = document.getElementsByClassName("signup_form")[0]
const signup_name = document.getElementById("signup_name")
const signup_email = document.getElementById("signup_email")
const signup_password = document.getElementById("signup_password")
const signup_msg = document.getElementsByClassName("signup_msg")[0]


// 點擊登入/註冊 顯示登入表單
login.addEventListener('click',()=>{
    login_form.style.display = "block"
    black_background.style.display = "block"
    login_form.style.animation="appear 0.5s ease"
    black_background.style.display = "appear 0.5s ease"
})

// 關閉登入表單
const close_login_form = document.getElementById("close_login_form")
close_login_form.addEventListener('click',()=>{
    login_form.style.display = "none"
    black_background.style.display = "none"
})
// 關閉註冊表單
const close_signup_form = document.getElementById("close_signup_form")
close_signup_form.addEventListener('click',()=>{
    signup_form.style.display = "none"
    login_form.style.display = "none"
    black_background.style.display = "none"
})
// 點選其他地方關閉登入或註冊表單
black_background.addEventListener('click',()=>{
    signup_form.style.display = "none"
    login_form.style.display = "none"
    black_background.style.display = "none"
})

// 切換至註冊表單
const try_signup = document.getElementsByClassName("try_signup")[0]
try_signup.addEventListener('click',()=>{
    signup_form.style.display = "block"
    login_form.style.display = "none"
    signup_form.style.animation = "appear 0.5s ease"
    black_background.style.display = "block"
    login_email.value = ""
    login_password.value = ""
    login_msg.textContent = ""
})

// 切換至登入表單
const try_login = document.getElementsByClassName("try_login")[0]
try_login.addEventListener('click',()=>{
    login_form.style.display = "block"
    signup_form.style.display = "none"
    login_form.style.animation = "appear 0.5s ease"
    signup_name.value = ""
    signup_email.value = ""
    signup_password.value = ""
    signup_password.value = ""
    signup_msg.textContent = ""
})

// 檢視畫面右上角登入狀態：有登入->顯示"登入系統"；沒登入->顯示"登入/註冊"
let src = '/api/user'
fetch(src,{method: "GET"})
    .then((res)=>{
    return res.json()
    })
    .then((result)=>{
    if(result["data"]!=null){
        login.style.display = "none"
        logout.style.display = "block"
        login_form.style.display = "none"
    }else{
        login.style.display = "block"
        logout.style.display = "none"
    }
    }).catch(err=>console.log(err))

// 登入系統
const login_button = document.getElementById("login_button")
login_button.addEventListener('click',(e)=>{
    e.preventDefault()
    loginSystem()
})
login_password.addEventListener('keypress',(e)=>{
    e.preventDefault()
    if(e.key === 'Enter'){
        loginSystem()
    }
})
const loginSystem = ()=>{
    if(login_email.value === "" && login_password.value === ""){
        login_msg.textContent = "尚有欄位未輸入"
        login_msg.style.color = "#ff2244"
    }else{
        let src = '/api/user'
        fetch(src, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
            "email": login_email.value,
            "password": login_password.value
            })
        })
        .then((res)=>{
            return res.json()
        })
        .then((result)=>{
            if(result["ok"]){
                location.reload()
            }else{
                login_msg.textContent = result["message"]
                login_msg.style.color = "#ff2244"
            }
        })
        .catch((err)=>{
        console.log("error",err)
        })
    }
}



// 點擊登出系統會導回首頁，並清除預定行程
logout.addEventListener('click',()=>{
    let src = '/api/user'
    fetch(src, {method: 'DELETE'})
    .then((res)=>{
        return res.json()
    })
    .then((result)=>{
        if(result["ok"]){
            document.location.pathname='/'
        }
    })
    .catch((err)=>{
    console.log("error",err)
    })
})
const logoutRemoveBooking = ()=>{
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
}

// 點擊註冊帳戶按鈕後進行資料驗證
const signup_button = document.getElementById("signup_button")
signup_button.addEventListener('click',(e)=>{
    e.preventDefault()
    //  姓名驗證:輸入2-20位中文或英文
    const signup_name_verify = /^[\u4e00-\u9fa5A-Za-z]{2,20}$/.test(signup_name.value)
    //  信箱驗證:符合信箱的格式(@前最多64字，@後的伺服器域名需要是以.來分開的格式)
    const signup_email_verify = /^\w+([\w\.\-]){1,63}\@\w+([\w\.\-])\.\w+([\w\.\-])$/.test(signup_email.value)
    //  密碼驗證:5-12位英數字(至少包含一個字母)
    const signup_password_verify = /(?=.*?[A-Za-z])\w{5,12}$/.test(signup_password.value)

    if (signup_name.value === "" || signup_email.value === "" || signup_password.value === ""){
        signup_msg.textContent = "尚有欄位未輸入"
        signup_msg.style.color = "#ff2244"
    }else if(signup_name_verify === false){
        signup_msg.textContent="姓名須為2-12位的中文或英文"
        signup_msg.style.color = "#ff2244"
    }else if(signup_email_verify === false){
        signup_msg.textContent="信箱格式不正確"
        signup_msg.style.color = "#ff2244"
    }else if(signup_password_verify === false){
        signup_msg.textContent = "密碼須為5-12位英數字，且至少包含1個字母"
        signup_msg.style.color = "#ff2244"
    }else{
    let src = '/api/user'
        fetch(src,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                "name": signup_name.value,
                "email": signup_email.value,
                "password": signup_password.value
            })
        })
        .then((res)=>{
            return res.json()
        })
        .then((result)=>{
            if(result["ok"]){
                signupSucess()
            }else{
                signup_msg.textContent=result["message"]
                signup_msg.style.color = "#FF2244"
            }
        })
        .catch((err)=>{
            console.log("error",err)
        })
    }
})
// 註冊成功：清除輸入欄的內容，轉向登入視窗
const signupSucess = ()=>{
    login_msg.textContent = "恭喜註冊成功！歡迎登入台北一日遊"
    signup_msg.textContent = "註冊成功！請在登入視窗進行登入"
    login_msg.style.color = "#448899"
    signup_msg.style.color = "#448899"
    signup_form.style.display = "none"
    login_form.style.display = "block"
    signup_name.value = ""
    signup_email.value = ""
    signup_password.value = ""
}

// 點擊預定行程：使用者有登入->導向booking頁面；沒有登入->顯示登入視窗
const booking = document.getElementById("booking")
booking.addEventListener('click',()=>{
    let src = '/api/user'
    fetch(src,{method: "GET"})
      .then((res)=>{
        return res.json()
      })
      .then((result)=>{
        if(result["data"]!=null){
            document.location.pathname='/booking'
        }else{
            login_form.style.display = "block"
            black_background.style.display = "block"
            login_form.style.animation="appear 0.5s ease"
            black_background.style.display = "appear 0.5s ease"
        }
      }).catch(err=>console.log(err))
})

// 點擊會員專區：使用者有登入->導向member頁面；沒有登入->顯示登入視窗
const member  = document.getElementById("member")
member.addEventListener('click',()=>{
    let src = '/api/user'
    fetch(src,{method: "GET"})
      .then((res)=>{
        return res.json()
      })
      .then((result)=>{
        if(result["data"]!=null){
            document.location.pathname='/member'
        }else{
            login_form.style.display = "block"
            black_background.style.display = "block"
            login_form.style.animation="appear 0.5s ease"
            black_background.style.display = "appear 0.5s ease"
        }
      }).catch(err=>console.log(err))
})

const checklogin = (pathname)=>{
    let src = '/api/user'
    fetch(src,{method: "GET"})
      .then((res)=>{
        return res.json()
      })
      .then((result)=>{
        if(result["data"]!=null){
            document.location.pathname = pathname
        }else{
            login_form.style.display = "block"
            black_background.style.display = "block"
            login_form.style.animation="appear 0.5s ease"
            black_background.style.display = "appear 0.5s ease"
        }
      }).catch(err=>console.log(err))
}


// 漢堡選單
const blue_background = document.getElementsByClassName("blue_background")[0]
const hamburger = document.getElementsByClassName("fa-bars")[0]
const list = document.getElementsByClassName("list")[0]
const close_icon = document.getElementsByClassName("fa-times")[0]
hamburger.addEventListener('click',()=>{
  hamburger.style.display = "none"
  close_icon.style.display = "block"
  blue_background.style.display = "block"
  list.style.display = "block"
})

close_icon.addEventListener('click',()=>{
  blue_background.style.display = "none"
  list.style.display = "none"
  hamburger.style.display = "block"
  close_icon.style.display = "none"
})

blue_background.addEventListener('click',()=>{
    close_hamburger()
})

container.addEventListener('click',()=>{
    if(document.documentElement.clientWidth < 900){
        close_hamburger()
    }
})

const close_hamburger = ()=>{
    blue_background.style.display = "none"
    list.style.display = "none"
    hamburger.style.display = "block"
    close_icon.style.display = "none"
}