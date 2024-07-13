const getDiffType = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("diffType", (data) => {
      if (chrome.runtime.lastError) {
        reject(`Error retrieving regexps: ${chrome.runtime.lastError}`);
        return;
      }

      const diffType = data.diffType || "words";
      resolve(diffType);
    });
  });
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("background handler", "message", message, "sender", sender);

  let { action, data } = message;
  data = data || {};

  if (action === "forwardToContentScript") {
    const { tabId, contentScriptData } = message;
    const diffType = await getDiffType();
    console.log("diffType", diffType);
    const { data } = contentScriptData;
    const newContentScriptData = { ...contentScriptData, data: { ...data, diffType } };
    chrome.tabs.sendMessage(tabId, newContentScriptData);
    return;
  }

  if (action === "getDiffType") {
    let { tabId } = data;
    if (!tabId) tabId = sender.tab.id;
    const diffType = await getDiffType();
    console.log("diffType", diffType);
    sendResponse({ diffType });
    return;
  }

  console.log("unhandled background handler", "message", message, "sender", sender);
});
