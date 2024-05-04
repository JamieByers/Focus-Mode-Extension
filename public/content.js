// content.js

// script injected into the webpage
function executeScript() {
  document.documentElement.innerHTML = "";

  addHTML();
}

// html to replace the page with
function addHTML() {
  const everything = document.querySelector("*");
  everything.style.textAlign = "center";

  const body = document.querySelector("body");
  body.style.display = "flex";
  body.style.justifyContent = "center";
  body.style.alignItems = "center";
  body.style.height = "100vh"; // Set the body height to 100% of the viewport height
  body.style.margin = "0"; // Remove default margins

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center"; // Center align the child elements horizontally

  const h1 = document.createElement("h1");
  h1.innerHTML = "Get Back To Work!!!";
  h1.style.textAlign = "center"; // Center align the text within the h1 element

  const p = document.createElement("p");
  p.innerHTML = "The Focus extension is preventing you access to this page";
  p.style.textAlign = "center"; // Center align the text within the p element

  container.appendChild(h1);
  container.appendChild(p);
  body.appendChild(container);
}

// Listen for messages from the background script or other content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message === "update") {
    console.log("update message received");
    sendResponse("message received: ", message.message);

    chrome.storage.sync.get(["state"]).then((result) => {
      console.log("Received value: ", result.state);
      const state = result.state;

      if (state) {
        executeScript();
      }
    });
  }
});
