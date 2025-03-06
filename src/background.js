'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message = `Hi ${sender.tab ? 'Con' : 'Pop'
      }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }
});

chrome.webRequest.onBeforeRequest.addListener(async detail => {
  console.log("detail.url", detail.url)
  const requestUrl = new URL(detail.url);

  const domain = requestUrl.searchParams.get("domain")
  const token = requestUrl.searchParams.get("token")

  console.log({domain,token})


  const juchaResponse = await fetch("http://47.243.10.224:10011/api.php",{
    method:"post",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body: `ym=${domain}&xq=y&page=1&limit=20&token=${token}&group=1&nian=`
})

  const juchaJson = await juchaResponse.json()
  console.log(juchaJson)
  const data = juchaJson.data.reduce((pre,next) => {
    return {...pre,[next.timestamp.slice(0,4)]:next.bt}
  },{})
  const body = {domain,data,referer:"waybackV1"}
  console.log(body);
  //上传数据
  await fetch("http://domain.8889.site/domain",{
    method:"post",
    headers:{
      "Content-Type": "Application/json",
    },
    
    body: JSON.stringify(body)
  })
},
  { urls: ["http://www.jucha.com/item/search*"] },
  // ["blocking"]
)