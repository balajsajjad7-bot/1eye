# 1EYE Instagram autopilot — runbook

Each daily run publishes ONE item from `calendar.json` to **@1eye.app**, using the built-in browser
on Balaj's PC (where @1eye.app is signed in). Instagram blocks pasting files from outside, so the post
or reel is generated inside the Instagram page with `noir.min.js` + `igkit.min.js`.

## Which item
The routine runs twice a day (about 12:47 and 19:47 Asia/Karachi). `perDay` in calendar.json is 2.
- `days = (today's date in Asia/Karachi − calendar.start)` in days
- `slot = 0` if the current Asia/Karachi hour is before 16:00, otherwise `1`
- `index = (days * perDay + slot) % items.length` (after the last item, start over)
If `days` is negative (before start), post nothing and report that.
History: the old 12-item calendar's first reel was posted 2026-11-20; the 20-item hook calendar starts 2026-11-21.

## Steps
1. Load the built-in-browser skill. Open (or reuse) a tab at `https://www.instagram.com/1eye.app/`.
   Check the page shows the 1eye.app profile with **Edit profile** (signed in as 1eye.app). If it asks to
   log in, or shows a checkpoint or "suspicious activity", STOP and report: never type passwords or codes.
2. Check that none of the 3 latest posts on the profile already has this item's caption (read the
   `img` alt text of the post links; photo posts often get an auto alt like "Photo by 1EYE…", so for those
   open the post and read its caption with get_page_text, then go back to the profile). If one does, it's already posted: STOP and report (no double posts).
3. Paste the full contents of `noir.min.js` with javascript_tool, then the full contents of `igkit.min.js`
   (two separate calls, each file verbatim). Verify: `typeof Noir.make==="function" && typeof IGKit.reel==="function"`.
   If the content didn't paste completely, paste it again; do not try to fetch it (Instagram's CSP blocks fetch).
4. Generate: post → `window.__f = await IGKit.post({label,title,body,index})`;
   reel → start `IGKit.reel({label,beats,seconds:8}).then(f=>window.__f=f)` and poll until set.
5. Click the **+** (Create) button in the bottom bar, wait ~1 s, then `IGKit.attach(window.__f)`.
   - Reel: if "Video posts are now shared as reels" appears, click OK.
   - Crop screen: click the crop/expand icon (bottom-left of the preview) and choose **Original** (posts: or the
     expand toggle). Click **Next** (use find "Next"). Reel edit screen: pick a cover frame showing the text, then **Next**.
6. Caption: click the "Add a caption…" / caption textbox, type `caption + "\n\n" + calendar.tags`.
   Read it back from the textbox and check it matches.
7. Click **Share**. Wait for "Your reel/photo was posted" or the profile count to rise. Report the result.

## Safety
- Publish only the calendar item for today; nothing else, no DMs, no follows, no likes, no comments.
- If Instagram shows any warning, rate limit or verification, stop and report; don't retry the same day.
