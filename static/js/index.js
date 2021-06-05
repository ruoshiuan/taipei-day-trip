let page = 0
let fetch_start = false
const content = document.getElementById("content")
const search = document.getElementById("search")
const footer = document.getElementById("footer")
const loadingIcon = document.getElementsByClassName("loading-icon")[0]

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
// 整理動態資料
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
// 顯示資料
const renderSpot = (info,pic,spot_name,mrt_name,cata_name)=>{
  content.appendChild(info)
  info.appendChild(pic)
  info.appendChild(spot_name)
  info.appendChild(mrt_name)
  info.appendChild(cata_name)
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
  root: null,
  rootMargin: '10px',
  threshold: 0.2
})
observer.observe(footer)
searching()

// 點擊按enter鍵之後搜尋景點
search.addEventListener('click',()=>{
  contentChildDelete()
  page = 0
  loadingIcon.remove()
  searching()
})
document.getElementById("input_value").addEventListener('keydown',(e)=>{
  if(e.key === 'Enter'){
    contentChildDelete()
    page = 0
    loadingIcon.remove()
    searching()
  }
})
// 清空content容器中的所有景點
const contentChildDelete = ()=>{
  while(content.hasChildNodes()) {
      content.removeChild(content.firstChild);
    }
}