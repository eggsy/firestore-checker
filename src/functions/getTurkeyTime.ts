export default function getTurkeyTime(): Date {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Europe/Istanbul",
    })
  );
}
