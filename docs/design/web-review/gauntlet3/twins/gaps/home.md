# home (05-home-f0): gaps

Crop [2, 2, 2636, 1436] (the whole window inside its 2px frame), scale 2 (sidebar "Inbox" and "Pulse" caps are 19px = 9.5 CSS), theme dark (Carbon: Linear's main panel is #171819, Carbon's page #171615). In CSS pixels the window is 1318 x 718.

Composition: Frame (sidebar), Page with a crumb title, `middle`, `action` and a `side` column; the issue in the body (Text display/body with a nested Text code, Section "Activity", events as Stack + Avatar/Icon + nested Text, the first thread as Surface sheet + Thread, the agent session as Surface sheet > Surface list > two Row items); the agent chat in the side column (Button row, Text and a bare Icon for the Reviews property, Surface sheet `fill` holding Avatar, Chip, quiet Buttons, Surfaces, Text, Composer).

## Things the kit has no piece for

- Icon: Linear's logo (a white disc with diagonal stripes) / no logo / Frame's Space tile ("L" on the accent) in the sidebar head; Avatar size sm "LI" (neutral disc) in the chat head and the agent-session card.
- Icon: Pulse's bare lightning bolt / the only bolt is the `feature` type glyph, which sits on a filled square / `feature` (reads as a type badge, not a nav glyph).
- Icon: Initiatives (a ring with an upward arrowhead) / none / `loop`.
- Icon: Agent tasks (a square with a cursor arrow) / none / `compose`.
- Icon: UI Refresh (orange crossed ruler and pencil) / none / `close` (grey X).
- Icon colour in Frame: Linear's favourites carry their own colours (the issue's yellow in-progress ring, Agent Insights' indigo bars, UI Refresh's orange) / NavItem.icon is an IconName drawn in --side-icon, no tone and no Mark / `theme` (half-filled ring), `high` (signal bars), `close`, all grey.
- Icon colour on the page: Linear's "Reviews / Revert" property leads with its pull-request glyph in indigo (a link's colour) / Icon has no tone, and no screen tints one / `workflow` bare, in the icon ink (grey), so the property reads as plain text.
- Icon: a star (Favorite, yellow, filled) / none / `gate` diamond on a quiet Button.
- Icon: up and down arrows (previous / next issue) / only chevrons (`up`, `chevron`) and a right `arrow` / `up` and `chevron`.
- Icon: a label tag (activity "added the labels") / none / `intake` tray, quiet.
- Icon: the four-dot "agent working" glyph / none / `grip` (six dots), quiet.
- Icon: Linear's git-pull-request and draft-PR glyphs (Reviews, Revert, the change card's "Draft", copy branch name) / none (`branch` is a three-node branch) / `workflow`, which has Linear's top-left node and bottom-right node.
- Icon: "Worked for 10 sec ▸" ends on a small solid right-pointing triangle / `caret` is a solid triangle pointing down only / `right` (a line chevron), quiet.
- Icon: Copy ID (a card with an ID badge), the split "delegate" button (a list with an arrow, then a chevron) / none / `copy`, `arrow`, `chevron` as three separate square Buttons.
- Icon: minimize (a low dash), the paperclip, the capture frame, the round send arrow / `minus` (a centred dash), no paperclip, `queue` (corners plus a centre dot) / `minus`, `link`, `queue`.
- Avatar: photo avatars (karri, jori, the actor of "Linear created the issue") at 14-15 CSS px / initials only / Thread's 24px hued initials for comments, Avatar size sm (16px neutral "KA") for the activity line.
- Mark: Linear's yellow In Progress ring with a half fill (top bar, final event, sidebar favourite) / the nearest is `run`, an orange ring with a half pie; no Mark kind is yellow / `run` glyph `still` on the final event; nothing in the top bar (see Page) and `theme` in the sidebar.
- Text: an inline code span in running text (`vehicle_state`: about 13px mono in the bright ink on a lighter rounded box (about #232425 on #171819, radius about 4) with a hairline, about 24px tall, set off from the words by about 6px each side) / no inline-code look: Text variant="code" is a 12px Geist Mono span with no box, no hairline and no room either side / Text variant="code" tone="1" nested in the body Text. The ink matches; the box, the hairline and the room are missing, and the mono runs 3px smaller than the 15px words round it, so it reads as a word in another font, not a chip. (Badge kind="kbd" draws a box, but it is a keycap, 11px semibold on 18px, which our screens use only for keyboard keys.)
- Timeline connector: the short vertical rule joining two consecutive activity events / none / dropped (the two events sit 16px apart).
- Thread: a rule between a comment and its reply, inset from the content edge to the card's right edge / no rule; messages part by 24px of room / dropped. (Putting each comment in its own Row item would draw a hairline, but full-width and with the list's 32px inset, and no screen puts a Thread in a Row.)
- Split button: Linear joins two icon actions in one pill with a hairline divider / no segmented icon pair / two square Buttons.
- Composer toolbar: Linear's reply box is a tall box (about 93px) whose foot holds "Skills ⌄", a capture icon, a paperclip and a round send button / Composer is one line with a "Send" text button and no toolbar / Composer, then a row under it (outside the box) with a quiet "Skills" Button, a chevron Icon, and quiet `queue` and `link` Buttons.

## Things a kit component draws differently, that no composition avoids

- Frame: the sidebar is 228px; Linear's is about 240px.
- Frame: the sidebar's ground is a step lighter than the page (Carbon #1e1d1c on #171615); Linear's sidebar is darker than its main panel (#131516 on #171819).
- Frame: always draws the Theme select ("Theme · Carbon ˄") at the sidebar's foot; Linear's sidebar has nothing at the foot. Passing `foot={[]}` leaves the theme row.
- Frame: the head's search and new-issue buttons sit at the row's end only when a signed-in face is drawn (`.me` has the `margin-right: auto`); with `me={null}` (Linear shows no face) they hug the switcher's chevron. Linear has them at the sidebar's right edge with no face.
- Frame: the Space name is 13px 600; Linear's "Linear" is about 14.5px 600.
- Frame: a section heading opens 20px of group gap plus 6px above its label (Workspace sits about 9px lower than Linear's), and the current item's pill is a firmer fill (9% ink) than Linear's barely-there one.
- Frame / Page: the main column runs flush beside the sidebar on one plane; Linear's main is an inset panel (8px off the window's top, right and bottom) with a hairline and rounded corners, standing on the sidebar's darker ground.
- Page: the top bar is 58px; Linear's is 44px under an 8px inset. Its hairline starts at the gutter (24px in), Linear's runs the panel's full width. Everything in the side column starts about 23px lower than Linear's (the issue actions at y 97 against 74).
- Page: there is no slot before the title, so the issue's status glyph that leads Linear's bar ("◐ DRV-8852 Faster app launch") can't be drawn; the crumb pair (the only form that draws the key and the title at bar size) puts a "›" between the key and the title, and draws the key in ink-3 where Linear's key is as bright as the title.
- Page: the body column starts at the gutter (24px from the sidebar) with 32px of room under the bar; Linear's issue column starts about 72px into its panel. An empty Stack (the queue's spacer idiom) brings the title down to Linear's height; the left edge stays 60px further left than Linear's, and the column is wider (634px against Linear's 520-570), so the description breaks after "instead of" where Linear's breaks after "present,".
- Page: the side column is a tinted rail (--tk-well) ruled off by a full-height hairline from the bar down, 400px at this width; Linear has no rail: its properties ("Reviews / Revert") lie on the page and the agent chat floats as a card over the page and the activity cards (which run on under it, to the panel's edge). Ours stop at the body column's end, 32px short of the rail.
- Page: the side column pads 24px, so the chat card inside it is 352px wide (content 320px) where Linear's chat card is 400px (content about 367px); the agent's 14px reply wraps to three lines where Linear's 13px wraps to two.
- Text display: the issue title is 28px; Linear's is about 20.5px (cap 15 CSS px).
- Text body: 15px on a 1.6 line (24px); Linear's description is about 14.5px on about 21px.
- Section: the heading is 15px; Linear's "Activity" is about 16.5px. The head's 16px to its body is fixed; Linear leaves about 27px between "Activity" and the first event.
- Text tones: Carbon's ink-3 (#a9a5a1) is much brighter than Linear's muted activity grey, so the activity lines read a step louder; the strong words (tone 2, 500) are close to Linear's.
- Thread: faces are 24px hued discs (`talk`); Linear's comment avatars are 14-15px. Every message's body is indented to the name's column; Linear's first comment's body starts under the avatar and only the reply is indented. The name line is 24px tall, so the comment card runs about 5px taller than Linear's (152 against 147).
- Thread: "mine" (the kit's lighter raised bubble, right-aligned, max 88%) always draws a "You · time" line above the bubble; Linear's chat bubble has none. Used a Surface sheet in a right-aligned Stack instead, which is darker than its ground (sheet --tk-card on the rail) with a hairline, where Linear's bubble is a lighter fill (#262728 on #1b1c1d) with no visible edge. A sheet has no max width, so the bubble runs the card's full width; Linear's stands about 26px in from the left, at about 90%.
- Surface sheet: one fill (--tk-card, 2.5% ink over the page) for every card; inside the side rail (--tk-well, 4%) a sheet is darker than what it rests on. Linear's chat card is a step lighter than the page and its bubble, change card and reply box are lighter still (#252728, #232425).
- Surface sheet: one padding for everything in it. Linear's chat card holds its sub-cards (bubble, change card, reply box) about 10px from its edge and its text lines (head, "Worked for", the reply) about 20px; ours holds both at 16px, so the text lines run flush with the sub-cards' edges.
- Surface sheet: no outdent. Linear's activity cards hang about 16px out of the text column, so a comment's avatar lines up with the title and the events; ours sit on the column's edge, their content 14px (pad 7) inside it.
- Surface sheet: radius 10px; Linear's activity cards are about 6px.
- Row item: content starts 32px in (list-inset) and runs 46px tall; Linear's agent-session rows start 16px in (like the comment card beside them) and are 44-45px.
- Chip edge: a round pill on a hairline ("Opus 5.5"); Linear's model tag is a rounded rectangle (about 4px) on a hairline.
- Button: square icon buttons are filled 28px squares on a hairline (radius 6); Linear's issue actions are 28px circles on a hairline with no fill. "Preview" is a filled square button; Linear's is a pill on a hairline.
- Button sm: 28px tall; it makes the change card's first row taller than Linear's (Linear's Preview pill is about 22px): Linear's three lines sit 23px apart, ours 29 then 23.
- Composer: "Send" is a text button; Linear's send is a round icon button with an up arrow.
- Mark run: orange (the kit's running hue); Linear's in-progress ring is yellow.
