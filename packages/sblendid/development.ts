import Sblendid from "./src";

(async () => {
  const sblendid = new Sblendid();
  let i = 0;

  console.log("Powering on...");
  await sblendid.powerOn();
  console.log("Powered on!");

  console.log("Starting to scan...");
  sblendid.startScanning(async peripheral => {
    if (
      !peripheral.advertisement ||
      !peripheral.advertisement.localName ||
      !peripheral.advertisement.serviceUuids
    ) {
      process.stdout.write(".");
    } else {
      console.log("");
      const { uuid, rssi, advertisement } = peripheral;
      const { localName, serviceUuids } = advertisement;
      console.log(localName, `(${rssi})`, `(${uuid})`);
      console.log(serviceUuids);
      if (++i >= 3) {
        console.log(`Stopping scanning after ${i} peripherals`);
        await sblendid.stopScanning();
        console.log("Stopped");
        process.exit();
      }
    }
  });
})();