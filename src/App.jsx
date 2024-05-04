import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // toggle extension on and off
  function ToggleButton() {
    const [state, setState] = useState(false);

    // get on/off state from storage
    useEffect(() => {
      chrome.storage.sync.get(["state"], (result) => {
        setState(result.state || false);
      });
    }, [state]);

    // change the on/off state
    function handleClick() {
      console.log("button clicked");
      let newState = !state;
      setState(newState);

      chrome.storage.sync.set({ state: newState });
      chrome.runtime.sendMessage({ message: "refresh" });
    }

    return (
      <>
        <button onClick={handleClick}>{state ? "ON" : "OFF"}</button>
      </>
    );
  }

  // refresh all tabs button
  function RefreshTabs() {
    // send message to refresh tabs
    function handleRefresh() {
      chrome.runtime.sendMessage({ message: "refresh" });
    }

    return (
      <>
        <button onClick={handleRefresh}>Refresh Tabs</button>
      </>
    );
  }

  // input to add websites to the websites blocked
  function InputForm() {
    const [websites, setWebsites] = useState([]);

    // get websites from local storage so all websites are always displayed when click off the extension or not
    useEffect(() => {
      const defaults = ["youtube", "twitch", "instagram"];
      chrome.storage.sync.get(["blacklist"]).then((result) => {
        setWebsites([...result.blacklist] || defaults);
      });
    }, []);

    // add website to blacklist
    function handleSubmit(e) {
      e.preventDefault();
      const newWebsite = e.target.elements.website.value.trim();
      //check if there is an input and input isn't already in the blacklist
      if (newWebsite !== "" && !websites.includes(newWebsite)) {
        const newWebsites = [...websites, newWebsite];
        setWebsites(newWebsites);
        // send message to add website to blacklist
        chrome.storage.sync.set({ blacklist: newWebsites }).then(() => {
          console.log("set blacklist to: ", newWebsites);
        });
      }
      // set input back to blank
      e.target.elements.website.value = "";
    }

    // function to display all of the websites in the blacklist
    function displayWebsites() {
      // if there is no blacklist display nothing
      if (websites.length === 0) {
        return null;
      }

      // remove the website from the blacklist
      function handleRemove(websiteToRemove) {
        // remove website from the blacklist
        const newWebsites = websites.filter(
          (website) => website !== websiteToRemove
        );
        setWebsites(newWebsites);

        // set the blacklist to the new blacklist
        chrome.storage.sync.set({ blacklist: newWebsites }).then(() => {
          console.log(websiteToRemove, "removed");
        });
      }

      // display the blacklist website at a time in a column
      return (
        <>
          <div className="websitesList">
            {websites.map((w, i) => {
              return (
                <>
                  <div key={i} className="webRow">
                    <p key={i}>{w}</p>
                    <button
                      key={i}
                      onClick={() => handleRemove(w)}
                      className="removeButton"
                    >
                      Remove
                    </button>
                  </div>
                </>
              );
            })}
          </div>
        </>
      );
    }

    // clear all of the websites in the blacklist
    function handleClear() {
      chrome.storage.sync.set({ blacklist: [] }).then(() => {
        console.log("Local Storage Cleared");
      });
      setWebsites([]);

      // reset height after clear due to bug - temporary solution
      document.querySelector("body").style.height = "300px";
      document.querySelector("body").style.height = "100vh";
    }

    // add the features
    return (
      <>
        <div className="blacklistHandling">
          <form onSubmit={handleSubmit}>
            <input type="text" name="website" />
            <button type="submit">Submit</button>
          </form>
          <button onClick={handleClear} type="button">
            Clear
          </button>
        </div>
        {displayWebsites()}
      </>
    );
  }

  // mute/unmute all tabs
  function MuteAllButton() {
    const [muted, setMuted] = useState(false);

    // remember whether tabs are muted or unmuted
    useEffect(() => {
      chrome.storage.sync.get(["muted"]).then((result) => {
        setMuted(result.muted || false);
      });
    }, []);

    // function to send message to mute/unmute all tabs
    function handleMuteAll() {
      const newMuted = !muted;
      setMuted(newMuted);

      // set muted status in storage
      chrome.storage.sync.set({ muted: newMuted });

      const msg = muted ? "unmuteAll" : "muteAll";

      chrome.runtime.sendMessage({ message: msg }, (response) => {
        console.log("Mute message sent, message: ", msg);
        console.log(response);
      });
    }

    return (
      <>
        <button onClick={handleMuteAll}>
          {muted ? "Unmute" : "Mute"} Tabs
        </button>
      </>
    );
  }

  return (
    <>
      <div className="tabOptions">
        <ToggleButton />
        <RefreshTabs />
        <MuteAllButton />
      </div>

      <InputForm />
    </>
  );
}

export default App;
