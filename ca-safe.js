/* Computing Adventure - Safe Harbor: gentle, simulated practice for staying safe online. */
(function () {
  'use strict';
  const CA = window.CA, S = CA.scenes, g = S.g, x = S.x, choose = S.choose, sort = S.sort, spot = S.spot, info = S.info, chat = S.chat;
  const TELL = 'Telling a trusted grown-up is always right, and you are never in trouble for telling.';

  const SCENES = [
    { id: 's-secret', emoji: '🔑', title: 'Secret passwords', blurb: 'Keep them strong and keep them yours', min: 0, take: 'A password is a secret. Make it long, make it strange, and share it only with the grown-ups who look after you.', steps: [
      choose('Your friend says, “Tell me your password and I will let you play my game!” What do you do?', chat('Message', [['Friend', 'give me ur password and I will give u my rare skins!']]), [
        g('Say no kindly: “It’s my secret!”', 'Passwords stay secret, even from friends. Your parents can know it, to help keep you safe.'),
        x('Tell them. They are my friend.', 'Even good friends can make mistakes with it or pass it on. A password is like a toothbrush: just for you.'),
        x('Give them a different password instead.', 'Better to say no. Never trade passwords for anything.')]),
      sort('Which passwords are strong? Sort them!', { e: '😬', n: 'Weak' }, { e: '💪', n: 'Strong' }, [
        { t: '12345', side: 'l', why: 'Too easy to guess.' }, { t: 'password', side: 'l', why: 'The most guessed password in the world.' },
        { t: 'purple-tiger-lamp-42', side: 'r', why: 'Long, random words: great!' }, { t: 'myname2014', side: 'l', why: 'Names and birth years are easy to guess.' },
        { t: 'sunny.pond.rocket.7', side: 'r', why: 'Random words and a number. Strong!' }]),
      { type: 'pass', q: 'Now build your own practice password' },
      choose('Where is it OK to type your password?', S.url('totally-real-login.example', false, 'Please log in to continue… (this page opened from a link in a message)'), [
        g('Only on the real app or website that I opened myself, or with a grown-up', 'Yes. A link in a message can lead to a fake page that steals your password.'),
        x('On any page that asks for it', 'Fake pages copy real ones to steal passwords. Be careful where you type it.')])] },
    { id: 's-private', emoji: '🏠', title: 'Private or public?', blurb: 'What is safe to share, and what is not', min: 0, take: 'Keep your address, phone number, school, passwords and plans private online. Ask a grown-up before sharing anything personal.', steps: [
      sort('Is it fine to share, or should it stay private?', { e: '🌞', n: 'Fine to share' }, { e: '🔒', n: 'Keep private' }, [
        { t: 'My favourite animal', side: 'l', why: 'Safe, fun, and does not tell anyone where you are.' }, { t: 'My home address', side: 'r', why: 'Strangers should never know where you live.' },
        { t: 'My phone number', side: 'r', why: 'Only for people your family trusts.' }, { t: 'My favourite colour', side: 'l', why: 'Totally safe.' },
        { t: 'The name of my school', side: 'r', why: 'It tells people where to find you.' }, { t: 'My password', side: 'r', why: 'Only you (and your grown-ups) know it.' },
        { t: 'Where we go on holiday this week', side: 'r', why: 'It tells people when your home is empty.' }, { t: 'My favourite game', side: 'l', why: 'Safe to chat about.' }]),
      choose('In a game chat, a player asks: “What’s your real name and where do you go to school?”', chat('Game chat', [['Player4412', 'whats ur real name? what school do u go to?']]), [
        g('“I don’t share that online.” Then ignore or block them.', 'Perfect. You never have to answer questions like that.'),
        x('Answer. It seems friendly.', 'Even friendly-sounding people can be strangers. Keep it private.')])] },
    { id: 's-yucky', emoji: '🛑', title: 'When something feels yucky', blurb: 'Stop, block, tell. You are never in trouble', min: 0, take: 'If something online feels scary or wrong: STOP, close it or turn the screen off, and TELL a grown-up. It is never your fault.', steps: [
      info('It can happen to anyone', 'Sometimes you might see something online that is scary, rude or just feels wrong. That is not your fault, and you did nothing wrong. Here is what to do.'),
      choose('A video starts playing and it is scary. What is the best first thing to do?', null, [
        g('Stop. Close it or turn the screen off, then tell a grown-up.', 'Stop and tell is exactly right. ' + TELL),
        x('Keep watching to see what happens.', 'It is normal to be curious, but it is kinder to your brain to stop.'),
        x('Hide it and tell nobody.', 'Telling is what makes things better. A grown-up can help, and you will not be in trouble.')]),
      choose('A friend says, “Just look at it, it is no big deal!” but it feels wrong.', null, [
        g('“No thanks.” Then tell a grown-up if they keep pushing.', 'Listening to your tummy feeling is smart. Your safety comes first.'),
        x('Look so they do not laugh at me.', 'A real friend will not make you do something that feels wrong.')]),
      info('Stop · Block · Tell', '🛑 STOP what you are doing. 🚫 BLOCK or close it. 🗣️ TELL a grown-up you trust. You can always tap the 💛 Help button in this app.')] },
    { id: 's-popups', emoji: '🪤', title: 'Pop-ups and prizes', blurb: 'Spot the tricks that want your click', min: 0, take: 'Surprise prizes and scary warnings are usually tricks. Close them with the small ✕, or ask a grown-up.', steps: [
      choose('A pop-up says you won a prize! What do you do?', S.popup('🎉 YOU ARE VISITOR #1,000,000!', 'Claim your FREE phone before time runs out!', 'CLAIM NOW'), [
        g('Close it with the small ✕ (or ask a grown-up)', 'Yes! Real prizes do not pop up like this.'),
        x('Click CLAIM NOW', 'That button could lead to a scam or a bad download.'),
        x('Type my name and address to get the prize', 'Never give private details to a pop-up.')]),
      choose('A site offers “Free game money! Just type your username and password.”', S.url('free-gems-generator.example', false, 'FREE GEMS! Enter your game username AND password!'), [
        g('Leave. Free-money sites are tricks to steal accounts.', 'Right. Nobody gives out free game money for your password.'),
        x('Try it, just once. What is the harm?', 'The harm is losing your account and everything in it.')]),
      choose('A big red message says, “WARNING: your computer has a virus! Call this number NOW!”', S.popup('⚠️ VIRUS ALERT ⚠️', 'Call 1-800-555-0100 immediately!', null), [
        g('Close it and tell a grown-up', 'Yes. Real warnings do not shout and rush you.'),
        x('Call the number to fix it', 'The people at that number would try to trick you into paying or giving access.')])] },
    { id: 's-friends', emoji: '🧑‍🤝‍🧑', title: 'Online friends and strangers', blurb: 'Who is really on the other side?', min: 1, take: 'Online, people can pretend to be anyone. Real friends never ask you to keep secrets from your family. Tell a trusted grown-up about anything that feels odd.', steps: [
      info('Anyone can pretend', 'Online, a “kid” could be a grown-up, and a nice person could be someone pretending. Someone you have only met online is still a stranger, even if you chat every day.'),
      choose('A player you only know from a game asks: “How old are you and where do you live?”', chat('Game chat', [['Sam_99', 'ur really good lol. how old r u? where do u live?']]), [
        g('“I don’t share that.” Then block them if they keep asking.', 'Great answer. A friendly person will understand.'),
        g('Ignore them and tell a grown-up if they ask again', 'Also good. Telling a grown-up always helps.'),
        x('Tell them. They seem nice.', 'Nice-seeming strangers can still be unsafe.')]),
      spot('Tap the red flags in this chat.', [
        'Sam: ', { t: '“Let’s chat somewhere private, not here.”', hot: true, why: 'Moving to a private chat takes you away from people who could help.' }, ' Sam: great game! Sam: ',
        { t: '“Don’t tell your parents about me.”', hot: true, why: 'Real friends never ask you to keep secrets from your family.' }, ' Sam: what is your favourite map? Sam: ',
        { t: '“I can send you free skins if you send me a photo.”', hot: true, why: 'Gifts in return for photos or favours are a trick.' }]),
      choose('Sam says, “It’s our secret. Don’t tell your mum.” What is the best thing to do?', chat('Private chat', [['Sam_99', 'its our secret ok? dont tell ur mum']]), [
        g('Tell a trusted grown-up straight away', 'Yes. You will not be in trouble, and telling keeps you safe. ' + TELL),
        x('Keep the secret so Sam stays my friend', 'A person who asks you to hide things from your family is not being a true friend.')]),
      choose('You told Sam your school’s name earlier and now you feel worried. What now?', null, [
        g('Tell a grown-up. You are not in trouble.', 'Everybody makes mistakes. Telling a grown-up helps fix it. ' + TELL),
        x('Say nothing and hope it is OK', 'Worrying alone is hard. Sharing the worry makes it smaller.')])] },
    { id: 's-photos', emoji: '📸', title: 'Think before you share a photo', blurb: 'Photos can say more than you mean', min: 1, take: 'Ask a grown-up before sharing photos, and ask your friends before sharing theirs. Photos can show where you live and go to school.', steps: [
      spot('This child is about to post this photo. Tap everything that tells a stranger where they are.', [
        { t: 'a school uniform with the crest', hot: true, why: 'Shows which school they go to.' }, ', ', { t: 'the house number on the door', hot: true, why: 'Shows exactly where they live.' }, ', ',
        { t: 'the street sign behind them', hot: true, why: 'Shows the road.' }, ', and the caption “', { t: 'First day at St Mary’s!', hot: true, why: 'Names the school.' }, '”. They are also ', { t: 'smiling', hot: false }, '.'],
        S.post('Pip', 'Photo with caption: First day at St Mary’s!', '🧒🏠')),
      choose('A friend posted a funny photo of you and you do not like it.', null, [
        g('Tell them kindly and ask them to take it down. You can say no.', 'Yes. You get a say in photos of you.'),
        x('Say nothing and feel bad', 'You are allowed to ask. A good friend will listen.')]),
      choose('You want to post a photo of your friend at your party.', null, [
        g('Ask your friend (and a grown-up) first', 'Yes. Everyone gets to decide about photos of themselves.'),
        x('Post it. It is a great photo!', 'Great photos can still embarrass or worry people. Always ask first.')]),
      info('Hidden location', 'Some photos secretly store where they were taken. Ask a grown-up to turn off location tags on your camera.')] },
    { id: 's-phish', emoji: '🎣', title: 'Fishy messages', blurb: 'Spot fake emails and texts', min: 2, take: 'Fake messages try to rush you and ask for passwords or money. Stop, do not click, check another way, and tell a grown-up.', steps: [
      spot('Tap the warning signs in this email.', [
        'From: Streamfun Support <', { t: 'help@streamfun-support-team.example', hot: true, why: 'The address is not the company’s real one.' }, '> Subject: ', { t: 'URGENT!!! Account suspended in 24 HOURS', hot: true, why: 'Rushing you is a classic trick.' }, ' ',
        { t: 'Dear user,', hot: true, why: 'Real companies use your name.' }, ' we saw strange activity. ', { t: 'Click here now and enter your password', hot: true, why: 'Real companies never ask for your password by email.' }, ' or your account will be ', { t: 'DELETED forever.', hot: true, why: 'Scary threats are a trick.' }, ' Thank you, Streamfun.']),
      choose('What should you do with that email?', null, [
        g('Do not click. Tell a grown-up and check by opening the real app yourself.', 'Perfect. Go to the real site yourself, never through the link.'),
        x('Click the link just in case', 'That is exactly what the sender wants.')]),
      choose('You get a text: “Hi love, it’s Dad, new phone! Can you buy gift cards for me? Don’t tell Mum.”', chat('Text message', [['Unknown number', 'hi its dad, new phone! need gift cards urgently. dont tell mum']]), [
        g('Do not reply. Check with Dad using the number you already have, or in person.', 'Yes. Secrets plus urgent money is a big warning sign.'),
        x('Help quickly, it is Dad!', 'Scammers pretend to be family. Always check another way.')])] },
    { id: 's-download', emoji: '📦', title: 'Apps, downloads and buying', blurb: 'Ask first. Beware of free and fast', min: 2, take: 'Ask a grown-up before downloading, buying or allowing permissions. Countdowns and “free” offers are there to rush you.', steps: [
      choose('You find an app called “Free V-Bucks Generator”. Install it?', S.url('app-store-lookalike.example', false, '⭐ Free V-Bucks Generator ⭐ 10,000,000 downloads!'), [
        g('No. Ask a grown-up, and only use the official app store.', 'Right. “Free currency” apps are tricks, and can carry viruses.'),
        x('Yes! It is free!', 'Free currency generators steal accounts or put viruses on devices.')]),
      choose('A game shows: “BUY 1000 GEMS for €99.99! Offer ends in 00:59!”', S.popup('⏳ LAST CHANCE!', 'Only 00:59 left to buy!', 'BUY NOW'), [
        g('Do not tap. Purchases need a grown-up, and countdowns are there to rush me.', 'Yes. Slow down: nothing real runs out in a minute.'),
        x('Tap it quickly before it ends', 'Spending money by accident is easy. Always ask a grown-up first.')]),
      choose('A torch app asks to see your contacts, camera and location.', S.popup('Allow “Super Flashlight” to access…', '📇 Contacts   📷 Camera   📍 Location', 'ALLOW ALL'), [
        g('Say No. A torch does not need those.', 'Great thinking. Only allow what an app really needs.'),
        x('Allow all, to make it work', 'Apps that ask for too much are suspicious.')])] },
    { id: 's-habits', emoji: '🌙', title: 'Healthy screen habits', blurb: 'Sleep, breaks and feelings', min: 1, take: 'Take breaks, keep screens out of bedtime, and notice how you feel. If something online makes you sad or worried, talk to someone.', steps: [
      sort('Sort these habits.', { e: '💚', n: 'Good habits' }, { e: '🟠', n: 'Change this' }, [
        { t: 'Stretch and look away every 20 minutes', side: 'l' }, { t: 'Screens in bed at night', side: 'r', why: 'Light and excitement keep your brain awake.' }, { t: 'Playing outside too', side: 'l' },
        { t: '“Just one more hour” of games', side: 'r', why: 'It is easy to lose track of time. Set a timer.' }, { t: 'Eating meals away from screens', side: 'l' }, { t: 'Scrolling when I feel sad', side: 'r', why: 'Talking to someone or moving your body helps more.' }]),
      choose('It is bedtime but your game is at the exciting part.', null, [
        g('Save, stop, and put the device away outside the bedroom', 'Yes. The game will still be there tomorrow.'),
        x('Keep going. Nobody will notice.', 'Sleep is when your brain grows and learns.')]),
      choose('You feel sad or grumpy after scrolling for a long time.', null, [
        g('Take a break, get some air, and talk to someone', 'Good. If it happens a lot, tell a grown-up.'),
        x('Scroll more to feel better', 'More scrolling usually makes it worse.')])] },
    { id: 's-real', emoji: '🧐', title: 'Real or fake?', blurb: 'Chain messages, fake pictures and tricky videos', min: 2, take: 'Pause and check. Who made it? Do trusted places say the same? Does it try to make me angry or rush me?', steps: [
      choose('A post says, “Share this with 10 friends or something bad will happen!”', S.post('Random post', 'SHARE WITH 10 FRIENDS OR BAD LUCK FOREVER!!!', '😱'), [
        g('Do not share. Chain messages are tricks.', 'Right. Nothing bad happens, and sharing spreads worry.'),
        x('Share it, just in case', 'It is only made to be shared.')]),
      choose('A picture of a dog looks amazing, but it has six legs. How might that happen?', S.post('Pretty pics', 'Look at my amazing dog!', '🐕🐕'), [
        g('It could be made by AI, so look closely and check the source', 'Yes. Pictures can be made or edited. Look for odd details.'),
        x('Cameras sometimes make extra legs', 'Cameras do not do that, but AI picture makers sometimes do.')]),
      choose('A video shows a famous person saying something shocking.', null, [
        g('Check trusted places and ask a grown-up before I believe or share it', 'Yes. Videos and voices can be faked.'),
        x('Share it right away. It is shocking!', 'Shocking content spreads fastest, and fakes use that.')])] },
    { id: 's-scam', emoji: '🧾', title: 'Scams and voice tricks', blurb: 'When it is not who it says it is', min: 2, take: 'Never send money or codes because a message or call says so. Hang up, check another way, and use a family safe word.', steps: [
      choose('Text: “Hi, I’m your cousin on a new number. I need €50 urgently. Don’t tell your parents.”', chat('Text message', [['New number', 'cuz its me, need 50 euro urgent, dont tell ur parents']]), [
        g('Do not send anything. Tell a grown-up.', 'Yes. Urgent money plus secrecy is a scam sign.'),
        x('Send it. Family helps family.', 'Real family can be checked with a real call to a known number.')]),
      choose('A call sounds exactly like your mum asking for a password. Computers can copy voices.', null, [
        g('Hang up and call back on the number you know. Ask for the family safe word.', 'Great. A family safe word, only your family knows, beats voice tricks.'),
        x('Tell her. It sounds just like her!', 'Voices can be faked now. Always check another way.')]),
      info('Make a family safe word', 'Ask your family to pick a secret word. Never post it. If anyone calls or messages asking for help, ask for the word.')] },
    { id: 's-privacy', emoji: '🔧', title: 'Make an account safer', blurb: 'Set up privacy like a pro', min: 2, take: 'Private accounts, hidden location and two-step login make you much safer. Ask a grown-up to help you check the settings.', steps: [
      { type: 'toggles', q: 'Pretend this is your new account. Switch the settings to the safest choices.', items: [
        { label: 'My profile is public', on: true, want: false, why: 'Private profiles are safer. Only friends you know can see them.' },
        { label: 'Show my location on posts', on: true, want: false, why: 'Hiding location keeps your home safe.' },
        { label: 'Anyone can message me', on: true, want: false, why: 'Only people you know should be able to message you.' },
        { label: 'Show my birthday', on: true, want: false, why: 'Birthdays help scammers. Keep it private.' },
        { label: 'Two-step login (a code as well as a password)', on: false, want: true, why: 'Two-step login protects you even if your password leaks.' }] }] },
    { id: 's-pressure', emoji: '🚨', title: 'Pressure and private pictures', blurb: 'A serious topic, handled gently', min: 3, take: 'Never send private pictures, and never give in to threats. If anything like this happens, even if it already did, tell a trusted adult. You are not in trouble and it is never too late to get help.', steps: [
      info('A hard topic', 'This is a serious topic, so we take it slowly. If it ever feels too big, tap 💛 Help at the bottom of the screen. The aim is simply to keep you safe, and no one here is in trouble.'),
      choose('Someone you only know online says, “Send me a private picture. It will just be between us.”', chat('Private chat', [['Online friend', 'send me a private pic of u. just between us, i promise']]), [
        g('No. Do not reply, block them, and tell a trusted adult.', 'Yes. Once a picture is sent, you cannot control where it goes. Telling an adult keeps you safe.'),
        x('Send it. They promised to keep it private.', 'Promises online cannot be trusted. Pictures can be copied and shared.')]),
      choose('They say, “If you don’t, I will show everyone / I will hurt you.”', chat('Private chat', [['Online friend', 'if u dont i will show everyone']]), [
        g('Do not give in. Block, keep the messages, and tell a trusted adult right away.', 'Threats mean this person is doing something wrong. It is never your fault, and adults can stop it.'),
        x('Do what they want so they stop', 'Giving in does not stop it. It usually makes it worse. Get help.')]),
      choose('What if you already sent a picture and feel awful?', null, [
        g('Tell a trusted adult now. You are not in trouble. There are services that can help get pictures removed.', 'This takes courage and it is the right move. Tap 💛 Help for helplines and removal tools.'),
        x('Hide it and hope it goes away', 'Hiding it makes it heavier. Adults have seen this before and know how to help without blame.')])] }
  ];

  SCENES.forEach(s => CA.items.safe.push({ id: s.id, emoji: s.emoji, title: s.title, blurb: s.blurb, min: s.min, route: '/safe/' + s.id }));
  CA.screens.safe = S.screen('safe', SCENES);
  CA.safeScenes = SCENES;
})();
