const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "messages", "en.json");

function main() {
  const raw = fs.readFileSync(file, "utf8");
  const data = JSON.parse(raw);

  // Fix about footer note
  if (data.about && data.about.footer) {
    data.about.footer.note = "SotsiaalAI © 2025";
  }

  // Ensure guide + sections_v2 exist
  if (!data.about) data.about = {};
  if (!data.about.guide) data.about.guide = {};
  if (!data.about.guide.sections_v2) data.about.guide.sections_v2 = {};

  const sections = data.about.guide.sections_v2;

  sections.accessibility = {
    title: "1. Language and accessibility",
    body:
      '<p>On your first visit the <a href="#" data-a11y-open="1">Language and accessibility</a> window opens so you can decide how SotsiaalAI should look and behave. You can open the same window later on the <a href="/profiil">Profile</a> page.</p>' +
      "<ul>" +
      "<li><strong>Language.</strong> Choose the interface language: Estonian, Russian or English.</li>" +
      "<li><strong>Text size.</strong> Pick the size that is easiest to read (small, standard, large or extra large).</li>" +
      "<li><strong>Contrast.</strong> Enable high contrast whenever you need clearer buttons and text.</li>" +
      "<li><strong>Animations.</strong> Select \"Reduce motion\" if movement distracts you or if your computer is slower — this can make the experience more stable.</li>" +
      "</ul>",
  };

  sections.home = {
    title: "2. Home page",
    body:
      '<p>The home page shows two role cards — "For social work professionals" and "For people seeking help" — and an <a href="/meist">ABOUT</a> link in the header that leads to the background page.</p>' +
      "<ul>" +
      "<li>If you are not signed in, clicking a role card opens the sign-in / registration view.</li>" +
      "<li>If you are already signed in, the system checks whether you have an active subscription, then opens the chat window for the selected role.</li>" +
      "</ul>",
  };

  sections.register = {
    title: "3. Registration and subscription activation",
    body:
      "<p>To use the SotsiaalAI chat assistant you need an account and an active subscription.</p>\n" +
      "<p><strong>3.1 Registration</strong></p>\n" +
      "<ol>\n" +
      '<li>On the home page choose the relevant role card and click <a href=\"/registreerimine\">Register</a>.</li>\n' +
      "<li>Fill in the registration form:\n" +
      "  <ul>\n" +
      "    <li>email address</li>\n" +
      "    <li>PIN code (4-8 digit numeric access code)</li>\n" +
      "  </ul>\n" +
      "</li>\n" +
      "<li>Accept the terms of use and the privacy policy.</li>\n" +
      "<li>After submitting the form we send a verification email - open the message and confirm your email address.</li>\n" +
      "</ol>\n" +
      "<p><strong>3.2 After confirming your email and activating your subscription</strong></p>\n" +
      '<p>After email confirmation you can sign in with your email address and PIN (see chapter "4. Sign-in and navigation by role").</p>\n' +
      "<p>If you do not yet have an active subscription, after the first sign-in you will be redirected automatically to the subscription page to activate access.</p>\n" +
      "<p>If a subscription is already active, the chat view for your role opens immediately.</p>",
  };

  sections.signin = {
    title: "4. Sign-in and navigation by role",
    body:
      '<p>Sign-in starts on the home page, which shows two role cards: "For social work professionals" and "For people seeking help".</p>\n' +
      "<ul>\n" +
      "<li>Click the relevant role card to open the sign-in dialog.</li>\n" +
      "<li>Enter your email address and PIN (4-8 digit numeric access code).</li>\n" +
      "<li>On the same previously trusted device/browser, the PIN is usually sufficient.</li>\n" +
      "<li>If you sign in from a new or unusual environment, we send a 6-digit verification code to your email. Enter the code in the input field.</li>\n" +
      '<li>Optionally select "Remember this device for 30 days" so that on this device you will usually only need your PIN next time.</li>\n' +
      '<li>If you forgot your PIN, use the <a href="/uuenda-pin">Forgot PIN</a> link to set a new PIN by following the instructions.</li>\n' +
      "<li>After a successful sign-in the chat view for your role opens. If access is limited (e.g. subscription is missing or expired), a notice and next steps are shown.</li>\n" +
      "</ul>",
  };

  sections.chat = {
    title: "5. Chat page",
    body:
      "<p>The chat page opens after sign-in only when the account has an active subscription. The view is the same for all roles and all interaction with the SotsiaalAI chat assistant happens here.</p>\n" +
      "<p><strong>Message input</strong></p>\n" +
      "<ul>\n" +
      "  <li>Type your question in the input at the bottom of the chat window and send it with the button or by pressing Enter.</li>\n" +
      '  <li>While the answer is being generated, the send button shows an animation and turns into "Stop answer", allowing you to interrupt streaming and continue typing.</li>\n' +
      "</ul>\n" +
      "<p><strong>Message view and scrolling</strong></p>\n" +
      "<ul>\n" +
      "    <li>When you scroll up, an arrow icon appears near the input to jump back to the end with a single click.</li>\n" +
      "</ul>\n" +
      "<p><strong>Adding a document</strong></p>\n" +
      "<ul>\n" +
      "  <li>The paperclip button opens a file picker and lets you analyze documents (up to 50 MB), e.g. PDF, DOC/DOCX, TXT, MD or HTML.</li>\n" +
      "  <li>Documents are not stored permanently — they are only used for analysis in the context of the current conversation.</li>\n" +
      "</ul>\n" +
      "<p>After a successful analysis you will see:</p>\n" +
      "<ul>\n" +
      "  <li>the file name and size,</li>\n" +
      "  <li>a scrollable document preview in the same card,</li>\n" +
      '  <li>a "Start your question" button which simply focuses the input field,</li>\n' +
      '  <li>a switch "Use as context for the next reply" which lets you choose between answering only from this file (checked) or from the regular SotsiaalAI knowledge base (unchecked).</li>\n' +
      "</ul>\n" +
      '<p>Below the card you will also see the daily analysis limit and a "Cancel" link to detach the file.</p>\n' +
      "<p><strong>Sources</strong></p>\n" +
      "<ul>\n" +
      '  <li>If the answer uses documents, the footer shows a "Sources" button which opens a list of referenced materials.</li>\n' +
      "</ul>\n" +
      "<p><strong>Conversations side panel</strong></p>\n" +
      "<ul>\n" +
      '  <li>The "Conversations" button in the top-left opens a side drawer where you can:</li>\n' +
      "</ul>\n" +
      "<ul>\n" +
      "  <li>load existing conversations,</li>\n" +
      '  <li>create a "New conversation",</li>\n' +
      "  <li>refresh the list,</li>\n" +
      "  <li>delete conversations you no longer need,</li>\n" +
      '  <li>use "Load more" to view older conversations.</li>\n' +
      "</ul>\n" +
      "<p>The active conversation is highlighted in the list and the drawer closes automatically when you select another conversation.</p>\n" +
      "<p><strong>Profile and accessibility</strong></p>\n" +
      "<ul>\n" +
      '  <li>The profile icon in the top-right opens the <a href="/profiil">Profile</a> page where you can update:</li>\n' +
      "</ul>\n" +
      "<ul>\n" +
      "  <li>account information,</li>\n" +
      "  <li>subscription settings,</li>\n" +
      "  <li>language and accessibility preferences (language, contrast, text size, animations).</li>\n" +
      "</ul>\n" +
      "<p><strong>Warnings</strong></p>\n" +
      "<ul>\n" +
      "  <li>If the conversation concerns a crisis situation, a red info box with emergency guidance is shown.</li>\n" +
      "</ul>",
  };

  sections.profile = {
    title: "6. Profile",
    body:
      '<p>The "Profile" page contains your account, subscription and accessibility settings.</p>' +
      "<ul>" +
      "<li>See your user role.</li>" +
      "<li>Show subscription: plan, monthly price and validity.</li>" +
      "<li><strong>To change email</strong> enter your current PIN; we send a verification email to the new address.</li>" +
      "<li><strong>To update PIN</strong> enter your current PIN and a new PIN (4-8 digits).</li>" +
      "<li>Adjust language, text size, contrast and motion preferences.</li>" +
      "</ul>",
  };

  sections.about = {
    title: "7. ABOUT",
    body:
      '<p>The <a href="/meist">ABOUT</a> page contains background information about the SotsiaalAI platform. It includes:</p>\n' +
      "<ul>\n" +
      "  <li>a short explanation of who the platform is for and how it helps;</li>\n" +
      '  <li>contact by email: <a href="mailto:info@sotsiaal.ai">info@sotsiaal.ai</a>;</li>\n' +
      '  <li><a href="/kasutustingimused">Terms of Use</a> and <a href="/privaatsustingimused">Privacy Policy</a>;</li>\n' +
      '  <li>a link to the <a href="/kasutusjuhend">Platform guide</a> (this guide).</li>\n' +
      "</ul>",
  };

  sections.quickstart = {
    title: "8. Quick overview",
    body:
      "<p>This is a short guide to using SotsiaalAI.</p>\n" +
      "<p><strong>First time</strong></p>\n" +
      "<ol>\n" +
      "  <li><strong>Open sotsiaal.ai</strong><br/>On your first visit choose language and accessibility (text size, contrast, animations).</li>\n" +
      "  <li><strong>Choose a role and create an account</strong>\n" +
      "    <ul>\n" +
      '      <li>On the home page pick the role card ("For social work professionals" or "For people seeking help") and click <a href="/registreerimine">Register</a>.</li>\n' +
      '      <li>Enter your email address and a PIN (4-8 digits) and accept the terms and privacy policy.</li>\n' +
      "    </ul>\n" +
      "  </li>\n" +
      "  <li><strong>Confirm email and sign in</strong>\n" +
      "    <ul>\n" +
      "      <li>Open the verification email and confirm your address.</li>\n" +
      '      <li>Then sign in with email + PIN. If needed, confirm with the 6-digit code sent to your email and optionally select "Remember this device for 30 days" on devices you trust.</li>\n' +
      "    </ul>\n" +
      "  </li>\n" +
      "  <li><strong>Activate subscription</strong>\n" +
      "    <ul>\n" +
      "      <li>If you do not yet have an active subscription, after the first sign-in you will be redirected to the Subscription page.</li>\n" +
      "      <li>Choose the plan and confirm payment (monthly fee €7.99).</li>\n" +
      "    </ul>\n" +
      "  </li>\n" +
      "  <li><strong>Start using the chat assistant</strong>\n" +
      "    <ul>\n" +
      '      <li>On the chat page type your question in the input field and press Enter or click "Send".</li>\n' +
      "      <li>Use documents and sources as described in section 5 of this guide.</li>\n" +
      "    </ul>\n" +
      "  </li>\n" +
      "</ol>\n" +
      "<p><strong>Next visits</strong></p>\n" +
      "<ol>\n" +
      '  <li>Open <a href="https://sotsiaal.ai">sotsiaal.ai</a>.</li>\n' +
      "  <li>If your device is remembered and you have an active subscription, you can usually sign in with just your PIN.</li>\n" +
      "  <li>If something seems off or access is limited, check your subscription status on the Profile page.</li>\n" +
      "</ol>",
  };

  // Remove legacy guide keys if present
  if (data.about.guide.chat) delete data.about.guide.chat;
  if (data.about.guide.profile) delete data.about.guide.profile;
  if (data.about.guide.about) delete data.about.guide.about;
  if (data.about.guide.quickstart) delete data.about.guide.quickstart;

  // Fix PWA instructions arrows
  if (data.start && data.start.instructions) {
    data.start.instructions.ios =
      "iPhone/iPad: open Safari, tap Share \u2192 Add to Home Screen.";
    data.start.instructions.mac =
      "Mac: open Safari and choose File \u2192 Add to Dock.";
  }

  // Fix meta titles with mojibake dashes
  if (data.meta && data.meta.terms) {
    data.meta.terms.title = "Terms of Use - SotsiaalAI";
  }
  if (data.meta && data.meta.privacy) {
    data.meta.privacy.title = "Privacy Policy - SotsiaalAI";
  }
  if (data.meta && data.meta.profile) {
    data.meta.profile.title = "My profile - SotsiaalAI";
  }
  if (data.meta && data.meta.register) {
    data.meta.register.title = "Create account - SotsiaalAI";
  }
  if (data.meta && data.meta.subscription) {
    data.meta.subscription.title = "Subscription - SotsiaalAI";
  }
  if (data.meta && data.meta.chat) {
    data.meta.chat.title = "Chat - SotsiaalAI";
  }
  if (data.meta && data.meta.start) {
    data.meta.start.title = "Next step - SotsiaalAI";
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

main();

