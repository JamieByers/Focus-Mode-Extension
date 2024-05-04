chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
    console.log(oldValue, " ---> ", newValue);
  }
});

// send message to content script to hide page
function sendMessageToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      console.log(activeTab.url);

      const defaults = ["youtube", "twitch", "instagram"];

      chrome.storage.sync.get(["blacklist"]).then((result) => {
        const websites = result.blacklist || defaults;
        let valid = true;

        for (let website in websites) {
          if (activeTab.url.includes(websites[website])) {
            valid = false;
            console.log("WEBSITE NOT VALID, CONTAINS ", website);

            // mute tab to also hide audio incase they are unable to disable the audio
            chrome.tabs.update(activeTab.id, { muted: true });
          }
        }

        if (valid === false) {
          chrome.tabs.sendMessage(activeTab.id, message, function (response) {
            console.log(`Received response: ${response}`);
          });
          console.log("WEBSITE VALID");
        }

        valid = true;
        console.log("");
      });
    }
  });
}

// run script when tabs are effected to block website
chrome.tabs.onActivated.addListener(function () {
  sendMessageToActiveTab({ message: "update" });
});
chrome.tabs.onCreated.addListener(function () {
  sendMessageToActiveTab({ message: "update" });
});
chrome.tabs.onUpdated.addListener(function () {
  sendMessageToActiveTab({ message: "update" });
});
chrome.tabs.onMoved.addListener(function () {
  sendMessageToActiveTab({ message: "update" });
});

// refresh all tabs:
chrome.runtime.onMessage.addListener((message, sender, response) => {
  if (message.message === "refresh") {
    chrome.tabs.query({}, (tabs) => {
      if (tabs.length > 0) {
        for (let tab of tabs) {
          chrome.tabs.reload(tab.id);
        }
      }
    });
  }
});

// mute all tabs
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message === "muteAll") {
    sendResponse("muting all tabs");
    chrome.tabs.query({}, (tabs) => {
      if (tabs.length > 0) {
        for (let t of tabs) {
          chrome.tabs.update(t.id, { muted: true });
          console.log("MUTED: ", t.title);
        }
      }
    });
  } else if (message.message === "unmuteAll") {
    sendResponse("unmuting all tabs");
    chrome.tabs.query({}, (tabs) => {
      if (tabs.length > 0) {
        for (let t of tabs) {
          chrome.tabs.update(t.id, { muted: false });
          console.log("UNMUTED: ", t.title);
        }
      }
    });
  }
});
