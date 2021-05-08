let page = 0
let fetch_start = false
const main = document.getElementsByTagName("main")[0]
const content = document.getElementById("content")
const search = document.getElementById("search")
const footer = document.getElementById("footer")
const loadingIcon = document.getElementsByClassName("loading-icon")[0]

const login = document.getElementById("login")
const close_loginin = document.getElementById("close_loginin")
const close_signup = document.getElementById("close_signup")
const try_signup = document.getElementById("try_signup")
const try_login = document.getElementById("try_login")
const black_background = document.getElementById("black_background")
const signup = document.getElementsByClassName("signup")[0]
const loginin = document.getElementsByClassName("loginin")[0]


// 連線json資料 搜尋景點
const searching=()=>{
  fetch_start = true;
  const keyword = document.getElementById("input_value").value
  let src;
  if(page != null && keyword){
    src = `/api/attractions?page=${page}&keyword=${keyword}`
  }else if(page != null){
    src = `/api/attractions?page=${page}`
  }else{
        return;
  }fetch(src)
    .then((res)=>{
      return res.json()
    }).then((result)=>{
      const spots = result.data
      const nextPage = result.nextPage
      if (spots.length!==0){
        spotData(spots)
        if(spots.length < 12){
          loadingIcon.remove()
        }
      }else{
        const not_found = document.createElement("p")
        not_found.textContent = `找不到其他符合「 ${keyword} 」的相關結果`
        content.appendChild(not_found)
        loadingIcon.remove()
      }
      page = nextPage;
    }).then(()=>{
        fetch_start = false
      })
}


const spotData=(spots)=>{
  for(let spot of spots){
    const name = spot.name
    const mrt = spot.mrt
    const category = spot.category
    const image = spot.images[0]

    const info = document.createElement("a")
    let url = `/attraction/${spot.id}`
    info.setAttribute("href",url)
    info.setAttribute("target","_blank")
    info.setAttribute("class","info")

    const pic = document.createElement("div")
    pic.setAttribute("class","pic")
    const spot_name = document.createElement("p")
    spot_name.setAttribute("class","spot_name")
    const mrt_name = document.createElement("p")
    mrt_name.setAttribute("class","mrt_name")
    const cata_name = document.createElement("p")
    cata_name.setAttribute("class","cata_name")

    pic.style.backgroundImage = 'url(' + image + ')'
    spot_name.textContent = name
    mrt_name.textContent = mrt
    cata_name.textContent = category
    renderSpot(info,pic,spot_name,mrt_name,cata_name)

  }
}

const renderSpot = (info,pic,spot_name,mrt_name,cata_name)=>{
  content.appendChild(info)
  info.appendChild(pic)
  info.appendChild(spot_name)
  info.appendChild(mrt_name)
  info.appendChild(cata_name)
}

// 點擊後搜尋景點
const clickFindSpot = ()=>{
  search.addEventListener('click',()=>{
    contentChildDelete();
    page = 0
    loadingIcon.remove()
    searching();
  })
}
clickFindSpot()

// 清空content容器中的所有景點
const contentChildDelete = ()=>{ 
  while(content.hasChildNodes()) {
      content.removeChild(content.firstChild);
    }
}

// 當視窗觸及觀察目標(footer)時，才載入下一頁景點；page==null就結束觀察
const callback = (entries, observer)=>{
  for(const entry of entries){
    // console.log(entry)
    if(entry.isIntersecting){
      if(page!=null){
        if(page>0){
          searching();
      }
      }else{
        observer.unobserve(footer)
      }
    }
  }
}
const observer = new IntersectionObserver(callback,{
  threshold: 0.5,
})
observer.observe(footer)
searching();


// 點擊登入/註冊 顯示登入表單
const clickLoginSignup = ()=>{
  login.addEventListener('click',()=>{
    loginin.style.display = "block"
    black_background.style.display = "block"
    loginin.style.animation="render_move 1s ease"
    black_background.style.display = "render_move 1s ease"
  })
}

// 關閉登入表單
const closeLoginForm = ()=>{
  close_loginin.addEventListener('click',()=>{
    loginin.style.display = "none"
    black_background.style.display = "none"
  })
}

// 關閉註冊表單
const closeSignupForm = ()=>{
  close_signup.addEventListener('click',()=>{
    signup.style.display = "none"
    loginin.style.display = "none"
    black_background.style.display = "none"
  })
}

// 切換至註冊表單
const switchToSignup = ()=>{
  try_signup.addEventListener('click',()=>{
    signup.style.display = "block"
    loginin.style.display="none"
    signup.style.animation = "render_move 1s ease"
    black_background.style.display = "block"
  })
}

// 切換至登入表單
const switchToLogin = ()=>{
  try_login.addEventListener('click',()=>{
    loginin.style.display = "block"
    signup.style.display="none"
    loginin.style.animation = "render_move 1s ease"
  })
}
clickLoginSignup();
closeLoginForm();
closeSignupForm();
switchToLogin();
switchToSignup();
