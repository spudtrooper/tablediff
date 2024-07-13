class Messages {
  constructor() {
    this.messages = [];
  }

  add(msg) {
    const id = Math.random().toString(36).substring(7);
    this.messages.push({ id, msg });
    return id;
  }

  remove(id) {
    const msg = this.messages.find(({ id: msgId }) => msgId === id);
    if (!msg) {
      return;
    }
    this.messages = this.messages.filter(({ id: msgId }) => msgId !== id);
  }

  show() {
    const messages = document.getElementById("messages");
    messages.innerHTML = "";
    messages.style.display = this.messages.length ? "block" : "none";
    this.messages.forEach(({ id, msg }) => {
      const msgDiv = document.createElement("div");
      msgDiv.textContent = msg;
      messages.appendChild(msgDiv);
    });
  }
}

const msgs = new Messages();

const showMessage = (msg) => {
  console.log("showMessage", msg);
  const id = msgs.add(msg);
  msgs.show();
  setTimeout(() => {
    msgs.remove(id);
    msgs.show();
  }, 5000);
};

const getDiffType = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["diffType"], (data) => {
      if (chrome.runtime.lastError) {
        reject(`Error retrieving regexps: ${chrome.runtime.lastError}`);
        return;
      }

      const diffType = data.diffType || "words";
      resolve(diffType);
    });
  });
};

const init = async () => {
  const diffType = await getDiffType();

  const sel = document.getElementById("diffType");
  sel.value = diffType;

  sel.addEventListener("change", async (event) => {
    const diffType = event.target.value;
    chrome.storage.local.set({ diffType });
    showMessage(`Diff type set to ${diffType}`);
  });
};

const main = () => {
  document.addEventListener("DOMContentLoaded", init);
};

main();
