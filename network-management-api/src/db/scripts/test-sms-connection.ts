import "dotenv/config";
import { checkTweetSmsConnection, sendTweetSms } from "../../modules/sms/tweetsms.util";
import { normalizePhone } from "../../modules/sms/sms.service";

async function main() {
  console.log("Checking TweetSMS connection...\n");

  const status = await checkTweetSmsConnection();

  console.log(`Configured:  ${status.configured}`);
  console.log(`Sender:      ${status.sender}`);
  console.log(`User:        ${process.env.TWEETSMS_USER?.trim() || "(missing)"}`);
  console.log(`OK:          ${status.ok}`);

  if (status.balance) console.log(`Balance:     ${status.balance}`);
  if (status.error) console.log(`Error:       ${status.error}`);
  if (status.responsePreview) console.log(`Preview:     ${status.responsePreview}`);

  const phoneArg = process.argv[2];
  if (phoneArg) {
    const normalized = normalizePhone(phoneArg);
    if (!normalized) {
      console.error("\nInvalid phone number.");
      process.exit(1);
    }

    if (!status.configured) {
      console.error("\nCannot send test SMS — TweetSMS is not configured.");
      process.exit(1);
    }

    console.log(`\nSending test SMS to ${normalized}...`);
    try {
      const receipt = await sendTweetSms(normalized, "WeWiFi — system test message");
      console.log("Test SMS sent:", receipt);
      process.exit(0);
    } catch (err) {
      console.error("Test SMS failed:", err instanceof Error ? err.message : err);
      process.exit(1);
    }
  }

  if (status.ok) {
    console.log("\nTo send a real test: npm run sms:test -- 0599123456");
  }

  process.exit(status.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
