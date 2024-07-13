const sendBackgroundMessage = ({ action, data, callback }) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    data = { ...(data || {}), tabId };
    chrome.runtime.sendMessage({ action, data }, response => {
      if (callback && response) {
        callback(response);
      }
    });
  });
};

const sendMessageToContentScript = ({ action, data }) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    data = data || {};
    data = { ...data, tabId };
    chrome.runtime.sendMessage({
      action: "forwardToContentScript",
      tabId: tabs[0].id,
      contentScriptData: { action, data },
    });
  });
};

const main = () => {
  const addEventListener = (id, event, handler) => {
    document.getElementById(id).addEventListener(event, () => {
      note(`handling ${event} event for element ${id}`);
      handler();
    });
  };

  addEventListener("clearButton", "click", () => {
    sendMessageToContentScript({ action: "clearDiffResults" });
  });
  addEventListener("resetButton", "click", () => {
    sendMessageToContentScript({ action: "reset" });
  });
  addEventListener("highlightTablesButton", "click", () => {
    sendMessageToContentScript({ action: "highlightTables" });
  });

};;

main();
