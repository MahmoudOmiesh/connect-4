import ngrok from "@ngrok/ngrok";

void (async function () {
  const listener = await ngrok.forward({
    // The port your app is running on.
    addr: 3000,
    authtoken: process.env.NGROK_AUTH_TOKEN,
  });

  // Output ngrok url to console
  console.log(`Ingress established at ${listener.url()}`);
})();

// Keep the process alive
process.stdin.resume();
