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

  console.log({ domain, token })


  const juchaResponse = await fetch("http://47.243.10.224:10011/api.php", {
    method: "post",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `ym=${domain}&xq=y&page=1&limit=20&token=${token}&group=1&nian=`
  })

  const juchaJson = await juchaResponse.json()
  console.log(juchaJson)
  const data = juchaJson.data.reduce((pre, next) => {
    return { ...pre, [next.timestamp.slice(0, 4)]: next.bt }
  }, {})
  const body = { domain, data, referer: "waybackV1" }
  console.log(body);
  //上传数据
  const response = await fetch(`https://strapi.998zy.com/api/domain-infos?filters[domain][$eq]=${domain}`, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer e6b42202a694cc159db3aa99a10ca36959897982c166f0dad7d7b2bc467334bfa343496ef491385cb8248ac96de5369fd7fa04fed08b9cce9d6d759af79adf196d08d6e340636fcb0cdbda70826819fe8cb970ddab8027c95f68cd2874cff3ce31a1d043289cdbb4287885244a2bd17767016fb551404bd3e99b760a7056c738"
    },

    body: JSON.stringify(body)
  })

  const { data: [{ documentId }] } = await response.json()
  await fetch(`https://strapi.998zy.com/api/domain-infos/${documentId}`, {
    method: "put",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer e6b42202a694cc159db3aa99a10ca36959897982c166f0dad7d7b2bc467334bfa343496ef491385cb8248ac96de5369fd7fa04fed08b9cce9d6d759af79adf196d08d6e340636fcb0cdbda70826819fe8cb970ddab8027c95f68cd2874cff3ce31a1d043289cdbb4287885244a2bd17767016fb551404bd3e99b760a7056c738"
    },

    body: { data: { history: data } }
  })
},
  { urls: ["http://www.jucha.com/item/search*"] },
  // ["blocking"]
)