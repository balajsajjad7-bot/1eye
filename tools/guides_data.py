import html
G=[]
def guide(slug,title,desc,h1,crumb,body,faq=None):
    G.append(dict(slug=slug,title=title,desc=desc,h1=h1,crumb=crumb,body=body,faq=faq or []))

guide('airdrop-for-windows','AirDrop for Windows: Free Way to Share Files Between PC and Phone (2026)',
'There is no official AirDrop for Windows. Here is the free way to drop files, photos and links between a Windows PC and Android or iPhone over Wi-Fi, without a cable or account.',
'AirDrop for Windows: the free way to share files with your PC','AirDrop for Windows',
'''<p class="lead">Apple's AirDrop only works between Apple devices, so a Windows PC can't receive from it. You can get the same "drop it and it arrives" experience on Windows with a free app called <a href="/">1EYE</a>, and it works with Android phones and iPhones too.</p>
<h2>What you need</h2>
<ul><li>A Windows 10 or 11 PC</li><li>A phone (Android or iPhone) on the same Wi-Fi, or any internet connection if you use Anywhere mode</li><li>About one minute</li></ul>
<h2>Set it up in three steps</h2>
<ol><li><b>Download 1EYE for Windows.</b> It's a single 16 MB file, <code>1EYE.exe</code>, from <a href="/#all">the download page</a>. There is nothing to install.</li>
<li><b>Open it.</b> If Windows shows "Windows protected your PC", click <b>More info → Run anyway</b>; 1EYE is open source but not code-signed yet. Your browser opens the 1EYE control panel with a QR code and a 6-digit PIN.</li>
<li><b>Scan the QR code with your phone.</b> Enter the PIN and name the phone. Done: anything you drop on either screen appears on the other.</li></ol>
<h2>What you can send</h2>
<ul><li><b>Files of any size</b> in full quality, photos, videos, PDFs, ZIPs</li><li><b>Text and codes</b> through a private chat between your own devices</li><li><b>Links</b> on a shelf you can open on the other screen in one tap</li></ul>
<div class="box glass"><p><b>Tip:</b> on Android, install <code>1EYE.apk</code> to share straight from Gallery or any app's Share menu. On iPhone, no app is needed: the QR code opens 1EYE in Safari.</p></div>
<h2>How is it different from Nearby Share or Phone Link?</h2>
<p>1EYE doesn't need a Microsoft or Google account, Bluetooth, or a phone from a particular brand. It runs over your own Wi-Fi, keeps files on your own PC, and the same app works on Windows, Mac and Linux. When you're away from home, one click on <b>Go online</b> gives your PC a private https link protected by your PIN.</p>
<h2>Is it safe?</h2>
<p>Files go straight between your devices. Nobody can join without the PIN, you can disconnect any device at any time, and the code is <a href="https://github.com/balajsajjad7-bot/1eye">public on GitHub</a>. See the <a href="/privacy.html">privacy policy</a> for exactly what 1EYE connects to.</p>''',
[("Is there an official AirDrop for Windows?","No. AirDrop only works between Apple devices. Apps like 1EYE give Windows the same kind of quick drop over Wi-Fi."),
 ("Does 1EYE work with iPhone?","Yes. Scan the QR code with the iPhone camera and 1EYE opens in Safari, no app needed."),
 ("Is 1EYE free?","Yes, free and open source under the MIT License, with no ads or account.")])

guide('transfer-files-android-to-pc-without-usb','How to Transfer Files from Android to PC Without a USB Cable (Wi-Fi, Free)',
'Move photos, videos and documents from an Android phone to a Windows, Mac or Linux PC over Wi-Fi: no USB cable, no account, full quality. Step-by-step guide.',
'Transfer files from Android to PC without a USB cable','Android to PC without USB',
'''<p class="lead">You don't need a cable, Bluetooth or a cloud upload to move files from Android to your computer. Over your home Wi-Fi it takes seconds, in full quality, with a free app called <a href="/">1EYE</a>.</p>
<h2>Step by step</h2>
<ol><li>On your PC, download and open <a href="/#all">1EYE</a> (Windows, Mac or Linux). It shows a QR code and a PIN.</li>
<li>On your Android phone, install <a href="/downloads/1EYE.apk">1EYE.apk</a> (Android 8 or newer). Allow "install unknown apps" for your browser when asked. You can also skip the app and just use the phone's browser.</li>
<li>Scan the QR code, enter the PIN, and name your phone.</li>
<li>Pick files in 1EYE, or use <b>Share → 1EYE</b> from Gallery, Files or any app. They arrive in the <code>1EYE_Shared</code> folder on your PC.</li></ol>
<h2>Why this beats the usual ways</h2>
<table><tr><th>Method</th><th>Problem</th></tr>
<tr><td>USB cable</td><td>Needs the right cable, driver and "File transfer" mode every time</td></tr>
<tr><td>WhatsApp to yourself</td><td>Compresses photos and video unless you send them as documents</td></tr>
<tr><td>Email</td><td>Attachments are limited to about 25 MB</td></tr>
<tr><td>Cloud upload</td><td>Uploads everything to someone else's server, then downloads it again</td></tr>
<tr><td><b>1EYE over Wi-Fi</b></td><td>None of the above: direct, full quality, no size limit</td></tr></table>
<h2>Not on the same Wi-Fi?</h2>
<p>Press <b>Go online</b> in 1EYE on your PC. It creates a private https link protected by your PIN, so your phone can send files from mobile data or any other network.</p>
<h2>Troubleshooting</h2>
<ul><li><b>Phone can't open the page:</b> make sure both devices are on the same Wi-Fi, not a guest network, and allow 1EYE through the Windows firewall when asked.</li>
<li><b>Slow transfers:</b> use the 5 GHz Wi-Fi band and keep the phone near the router.</li></ul>''',
[("Can I transfer files from Android to PC without USB?","Yes. With 1EYE both devices connect over Wi-Fi: scan a QR code once and send files in full quality without a cable."),
 ("Where do the files go on my PC?","Into the 1EYE_Shared folder next to the 1EYE app.")])

guide('iphone-to-windows-file-transfer','Send Photos from iPhone to Windows PC Without iTunes or Cable (Free)',
'Transfer photos and videos from an iPhone to a Windows PC over Wi-Fi in full quality, with no iTunes, iCloud or cable. Works in Safari, no app to install.',
'Send photos from iPhone to a Windows PC without iTunes','iPhone to Windows',
'''<p class="lead">AirDrop won't reach a Windows PC, and iTunes or iCloud are slow for a few photos. With <a href="/">1EYE</a> running on your PC, your iPhone can send photos and videos over Wi-Fi straight from Safari. No app to install on the iPhone.</p>
<h2>How to do it</h2>
<ol><li>Download and open <a href="/downloads/1EYE.exe">1EYE for Windows</a>. It shows a QR code and a PIN.</li>
<li>Open the iPhone <b>Camera</b> and point it at the QR code. Tap the link that appears; 1EYE opens in Safari.</li>
<li>Enter the PIN and give the iPhone a name.</li>
<li>Tap the upload area, choose <b>Photo Library</b>, select photos or videos, and they upload to your PC.</li></ol>
<div class="box glass"><p><b>About HEIC photos:</b> Safari may convert iPhone photos to JPEG while uploading. That's usually what you want on Windows, because JPEG opens everywhere. Videos upload as they are.</p></div>
<h2>Sending from PC to iPhone</h2>
<p>Drop files on 1EYE on your PC and open the 1EYE page in Safari on your iPhone. Tap a file to download it to the Files app, or long-press a photo to save it to Photos.</p>
<h2>Works from anywhere too</h2>
<p>Press <b>Go online</b> on your PC and your iPhone can reach it over mobile data, still protected by your PIN.</p>''',
[("Can I send photos from iPhone to Windows without iTunes?","Yes. Open 1EYE on the PC, scan its QR code with the iPhone camera, and upload photos from Safari over Wi-Fi."),
 ("Do I need an app on the iPhone?","No. 1EYE works in Safari on iPhone and iPad.")])

guide('send-large-files-phone-to-pc','How to Send Large Video Files from Phone to PC in Full Quality',
'Send 4K videos and multi-gigabyte files from your phone to your computer without compression or size limits, over Wi-Fi or the internet. Free method.',
'Send large videos from your phone to your PC in full quality','Large files phone to PC',
'''<p class="lead">Messaging apps squeeze videos and cap file sizes. Email stops at about 25 MB. To move a 4K video or a multi-gigabyte file from your phone to your computer intact, send it directly over Wi-Fi.</p>
<h2>The fast way: direct over Wi-Fi</h2>
<ol><li>Open <a href="/">1EYE</a> on your computer (Windows, Mac or Linux).</li>
<li>Connect your phone by scanning the QR code and entering the PIN.</li>
<li>Choose the video on your phone. It streams straight to the PC's disk with live speed shown, in the original quality.</li></ol>
<p>There is no fixed size limit: files are written to disk as they arrive, so the only limit is free space on the PC.</p>
<h2>How long will it take?</h2>
<table><tr><th>File</th><th>Typical home Wi-Fi (about 20 MB/s)</th></tr>
<tr><td>1-minute 4K video (about 400 MB)</td><td>About 20 seconds</td></tr>
<tr><td>10-minute 4K video (about 4 GB)</td><td>About 3 to 4 minutes</td></tr>
<tr><td>Photo library export (20 GB)</td><td>About 17 minutes</td></tr></table>
<p>Speeds depend on your router and how close you are; 5 GHz Wi-Fi is much faster than 2.4 GHz.</p>
<h2>When you're not at home</h2>
<p>Turn on <b>Go online</b> in 1EYE and send from anywhere through a private https link. It's slower than local Wi-Fi because it runs through your internet connection. For files you want to keep online, connect free cloud storage (Google Drive, Koofr or InfiniCLOUD) in 1EYE's Cloud page.</p>''',
[("How do I send a large video from phone to PC without losing quality?","Send it directly over Wi-Fi with an app like 1EYE. It transfers the original file without compression or a size limit."),
 ("Is there a file size limit in 1EYE?","No fixed limit; it is limited only by free disk space on the receiving device.")])

guide('access-pc-files-from-phone-anywhere','How to Access Files on Your Home PC from Your Phone, Anywhere',
'Get documents and photos from your home computer on your phone while you are away, with no port forwarding and no cloud upload. Free, PIN-protected.',
'Get files from your home PC on your phone, from anywhere','Access PC from phone',
'''<p class="lead">Left a file on your home PC? If 1EYE is running there, you can reach it from your phone over mobile data. No router settings, no port forwarding, no uploading everything to a cloud first.</p>
<h2>Set it up once</h2>
<ol><li>Run <a href="/">1EYE</a> on your home PC and link your phone by scanning the QR code.</li>
<li>In 1EYE's <b>Control</b> page, press <b>Go online</b>. Your PC gets a private https link; scan the new QR code with your phone or save the link.</li>
<li>For a link that never changes, add a free permanent domain in Control → My domain (optional).</li></ol>
<h2>Use it from anywhere</h2>
<p>Open the link on your phone, enter your PIN, and download any file in the shared folder or send new ones home. Chat and links sync too.</p>
<h2>Is it safe?</h2>
<ul><li>The link only works while 1EYE is online, and everyone still needs your PIN.</li>
<li>After 20 wrong PINs from the internet, sign-ins pause for 10 minutes.</li>
<li>Host controls (like changing the PIN or shutting down) only work on the PC itself.</li>
<li>You can press <b>Go offline</b> at any time.</li></ul>
<h2>Want files available when the PC is off?</h2>
<p>Connect free cloud storage in 1EYE's Cloud page and turn on auto-backup. With Google Drive you can also make public links that keep working when your PC is shut down.</p>''',
[("Can I get files from my home PC on my phone when I'm away?","Yes. Run 1EYE on the PC, press Go online, and open the private link on your phone with your PIN."),
 ("Do I need port forwarding?","No. 1EYE creates a secure tunnel link automatically.")])

guide('share-files-without-internet','How to Share Files Between Phone and PC Without Internet',
'Transfer files between your phone and computer with no internet connection, using only a local Wi-Fi network or a phone hotspot. Free, fast, no cable.',
'Share files between phone and PC without internet','Without internet',
'''<p class="lead">You don't need internet access to move files between devices that are close together. A local Wi-Fi network, even a router with no internet or your phone's hotspot, is enough.</p>
<h2>Option 1: any Wi-Fi router, even offline</h2>
<ol><li>Connect your PC and phone to the same Wi-Fi network.</li>
<li>Open <a href="/">1EYE</a> on the PC and scan its QR code with the phone.</li>
<li>Send files, text and links. Everything stays on your local network.</li></ol>
<h2>Option 2: use your phone's hotspot</h2>
<ol><li>Turn on the hotspot on your phone (mobile data can be off).</li>
<li>Connect the PC to the phone's hotspot.</li>
<li>Open 1EYE on the PC and scan the QR code. Transfers go directly between the two devices.</li></ol>
<div class="box glass"><p><b>Or let the phone host:</b> the 1EYE Android app can run the server itself. Start it on the phone and open the address it shows in the PC's browser.</p></div>
<h2>Good for</h2>
<ul><li>Travel, trains and flights with no signal</li><li>Offices or schools where cloud services are blocked</li><li>Moving big files without using mobile data</li></ul>''',
[("Can I transfer files without internet?","Yes. 1EYE works over any local Wi-Fi network or a phone hotspot with no internet connection."),
 ("Does it use mobile data?","Not on a local network. Only Anywhere mode uses the internet.")])

