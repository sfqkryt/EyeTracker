const cowsay = require("cowsay");

const appName = "EyeTrack Pro";

function showMessage(text, mode = "say") {
  const options = { text, e: "oO", T: "U " };
  if (mode === "think") {
    console.log(cowsay.think(options));
  } else {
    console.log(cowsay.say(options));
  }
}

showMessage(`${appName} has started!`, "say");
showMessage("Welcome!", "say");
showMessage("Loading...", "think");
showMessage(`${appName} is shutting down...`, "think");
showMessage("Goodbye!", "say");