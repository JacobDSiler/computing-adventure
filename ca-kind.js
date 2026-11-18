/* Computing Adventure - Kind Corner: digital manners practised in a pretend, safe chat. Nothing typed here is stored or sent. */
(function () {
  'use strict';
  const CA = window.CA, S = CA.scenes, g = S.g, x = S.x, choose = S.choose, sort = S.sort, info = S.info, chat = S.chat;

  const SCENES = [
    { id: 'e-sprout', emoji: '🌈', title: 'Kind words for friends', blurb: 'Pick the kind message', min: 0, take: 'Kind words make friends feel happy. Say what you would like to hear.', steps: [
      choose('Mia drew a picture of a cat. Which message is kind?', S.post('Mia', 'I drew my cat!', '🐱🖍️'), [g('“I love your cat! The colours are lovely.”', 'Kind and friendly!'), x('“That is a bad drawing.”', 'That would make Mia sad. Try something kind.')]),
      choose('Your friend lost the game and is sad. What do you say?', chat('Chat', [['Finn', 'I lost :(']]), [g('“Good try! Want to play again?”', 'Yes, that helps Finn feel better.'), x('“Ha ha you lost!”', 'That would hurt Finn’s feelings.')]),
      choose('Someone says something mean to you in a game.', null, [g('Do not say mean things back. Tell a grown-up.', 'Yes. Telling helps, and you stay kind.'), x('Say something mean back', 'That makes things bigger. Better to tell a grown-up.')])] },
    { id: 'e-think', emoji: '🧠', title: 'THINK before you post', blurb: 'Five quick questions before you hit send', min: 1, take: 'Before you post, THINK: is it True, Helpful, Inspiring, Necessary, Kind? If not, pause. You can always say it later, but you cannot un-say it.', steps: [
      info('T · H · I · N · K', 'Is it TRUE? Is it HELPFUL? Is it INSPIRING (or at least fun)? Is it NECESSARY? Is it KIND? You do not need five yeses every time. If you get a no, it is a signal to pause.'),
      sort('Post it or pause? Sort the drafts.', { e: '✅', n: 'Fine to post' }, { e: '✋', n: 'Pause first' }, [
        { t: 'Happy birthday Mia! 🎂', side: 'l', why: 'True and kind.' }, { t: 'Look at Tom’s silly haircut ha ha', side: 'r', why: 'It could embarrass Tom.' }, { t: 'So excited for the park today!', side: 'l' },
        { t: 'Everybody in our class hates Jo', side: 'r', why: 'Not true or kind, and it could hurt Jo.' }, { t: 'Come to my house! 12 Elm Road, 0851234567', side: 'r', why: 'That is private information.' }, { t: 'Great goal, Finn!', side: 'l' }]),
      choose('You are cross with a friend and type a mean message. What now?', null, [
        g('Stop, take a breath, and wait. Delete it or talk in person instead.', 'Yes. Messages cannot be un-sent, and feelings cool down.'),
        x('Send it. They started it.', 'Sending angry words usually makes it worse.')])] },
    { id: 'e-write', emoji: '✍️', title: 'Write a kind comment', blurb: 'Practise in a pretend feed', min: 1, take: 'Friendly comments, no private details, and no shouting. You can check any message before you post it.', steps: [
      { type: 'compose', q: 'Write a friendly comment on each pretend post.', praise: 'Friendly and safe. Lovely!', posts: [
        { who: 'Pip', text: 'I drew a dragon today!', em: '🐉', prompt: 'Say something kind about the dragon…' },
        { who: 'Mo', text: 'I lost my match today. 😞', em: '⚽', prompt: 'Cheer Mo up…' },
        { who: 'Bea', text: 'Look at the cake I baked!', em: '🎂', prompt: 'Write something friendly about the cake…' }] }] },
    { id: 'e-upstander', emoji: '🦸', title: 'Be an upstander', blurb: 'What to do when others are unkind', min: 1, take: 'Do not join in, do not share it, check on the person, and tell a grown-up. A little kindness from one person can change everything.', steps: [
      choose('Someone shares an embarrassing photo of Bea in the group chat. What do you do?', chat('Class group chat', [['Joe', '😂 look at Beas photo!!'], ['Kit', 'lol send it to everyone']]), [
        g('Do not share it. Message Bea privately to check she is OK, and tell a grown-up or teacher.', 'Yes. Being an upstander means standing up for someone.'),
        x('Share it. Everyone is.', 'Sharing makes it bigger and hurts Bea.'),
        x('Say nothing. It is not my business.', 'Staying silent can leave Bea alone. A small kind message makes a difference.')]),
      choose('Someone writes a mean comment under Bea’s post.', S.post('Bea', 'My first painting', '🎨'), [
        g('Do not join in. Report it, and write something kind to Bea.', 'Yes. Reporting and kindness both help.'),
        x('Add a laughing emoji', 'That joins in and makes it worse.')]),
      choose('A friend says, “Relax, it is just a joke!” but Bea is upset.', null, [
        g('A joke is fun for everybody. If someone is hurt, it is not a joke.', 'Exactly.'),
        x('Agree. It is only online.', 'Online feelings are real feelings.')])] },
    { id: 'e-mean', emoji: '😞', title: 'When someone is mean to you', blurb: 'Pause, save, block, tell', min: 1, take: 'If someone is unkind to you online: do not reply in anger, save it, block them, and tell a grown-up. You did nothing wrong.', steps: [
      choose('Someone sends: “You are so rubbish at this game, loser.” What is the best first move?', chat('Game chat', [['Player88', 'ur so rubbish at this game loser']]), [
        g('Do not reply in anger. Take a screenshot, block them, and tell a grown-up.', 'Yes. Saving it helps a grown-up take action.'),
        x('Write something mean back', 'It can turn into a bigger fight. Stay calm.')]),
      { type: 'breathe', title: 'Take a calm moment', text: 'It is hard when someone is unkind. Try three slow breaths.' },
      choose('A friend says, “Get them back! Post something nasty about them!”', null, [
        g('No. I will stay kind and let a grown-up handle it.', 'Staying kind keeps you safe and strong.'),
        x('Yes! They deserve it.', 'It will not fix anything and can get you into trouble too.')]),
      info('Save · Block · Tell', '📸 SAVE a screenshot. 🚫 BLOCK the person. 🗣️ TELL a grown-up. It is not your fault.')] },
    { id: 'e-tone', emoji: '🎭', title: 'How does it sound?', blurb: 'Words on a screen have no face', min: 2, take: 'Text has no voice or face. Short or ALL CAPS messages can sound cross. Add warmth, and check before assuming someone is upset.', steps: [
      choose('Alex replies to your invitation with just: “ok.” How might that feel?', chat('Chat', [['Alex', 'ok.']]), [g('It might sound cold or annoyed, though Alex may just be busy', 'Short replies can feel unfriendly. Do not guess: ask kindly.'), x('Definitely super happy', 'Hard to tell with no face or voice.')]),
      choose('Which message sounds friendliest?', null, [g('“Sure! See you at 3. 😊”', 'Warm and clear.'), x('“WHATEVER.”', 'That sounds like shouting.'), x('“fine.”', 'That could sound upset.')]),
      choose('“Great job…” might sound kind or sarcastic. How can you be clearer?', chat('Chat', [['Sam', 'Great job…']]), [g('Add something specific: “Great job on the goal!”', 'Specific praise is clear and kind.'), x('Leave it. They will know.', 'Without a face, sarcasm often gets missed.')]),
      choose('A message upsets you. What first?', null, [g('Ask: “Did you mean it like that?” before getting cross', 'Checking first clears up many misunderstandings.'), x('Reply straight away, angrily', 'Pause first. You might have misread it.')])] },
    { id: 'e-footprint', emoji: '👣', title: 'The internet remembers', blurb: 'Posts can last for years', min: 2, take: 'Anything you post can be copied or screenshotted. Post only what you would be happy for your gran, teacher or future boss to see.', steps: [
      info('Digital footprint', 'Everything you post leaves footprints. Even if you delete a post, someone may have saved a copy. Ask yourself: would I be happy if my gran, my teacher or a future boss saw this?'),
      sort('Happy for anyone to see, or keep it offline?', { e: '🌞', n: 'Happy for anyone' }, { e: '🌙', n: 'Keep offline' }, [
        { t: 'A photo of my sports-day medal', side: 'l' }, { t: 'A rant about my teacher', side: 'r', why: 'It could hurt or come back to bite you.' }, { t: 'My favourite book', side: 'l' },
        { t: 'An embarrassing video of my friend', side: 'r', why: 'It is theirs to share, not yours.' }, { t: 'A joke that could upset someone', side: 'r', why: 'If it might upset someone, skip it.' }]),
      choose('You posted something you regret.', null, [
        g('Delete it, say sorry if someone was hurt, and tell a grown-up', 'Everyone makes mistakes. Fixing them is what matters.'),
        x('Leave it and hope no one saw', 'Sorting it out early is easier.')])] },
    { id: 'e-games', emoji: '🎮', title: 'Good sports online', blurb: 'GG: kindness in games', min: 1, take: 'Be a good sport: say GG, encourage teammates, report cheaters, and mute or block anyone rude, then tell a grown-up.', steps: [
      choose('You lost. You feel like typing “you are trash” to the winner.', null, [g('Type “GG!” Good game.', 'Being a good loser is a superpower.'), x('Type something mean', 'It spoils the game for everyone.')]),
      choose('A teammate makes a mistake and others start yelling at them.', null, [g('Say, “It is OK! Next round!”', 'Encouragement helps the whole team.'), x('Join in the yelling', 'Yelling makes people play worse.')]),
      choose('Someone in voice chat is being rude and asking personal questions.', null, [g('Mute and block them, report it in the game, and tell a grown-up', 'You never have to put up with it.'), x('Answer their questions', 'Keep personal things private.')]),
      choose('You see someone cheating.', null, [g('Report it in the game. Do not cheat back.', 'Right. Cheating back does not help.'), x('Cheat too so it is fair', 'Two wrongs do not make a right, and you could lose your account.')])] },
    { id: 'e-calls', emoji: '📹', title: 'Video calls and emails', blurb: 'Good manners for calls and messages', min: 2, take: 'Mute when not talking, check your background, use a greeting, and think before you press Reply All.', steps: [
      choose('You join a class video call. What is polite?', null, [g('Stay muted until it is my turn, and be ready to be seen', 'Yes. Background noise is distracting.'), x('Talk loudly while others speak', 'It makes it hard for others to hear.')]),
      choose('Before turning your camera on, you should…', null, [g('Check what is behind me (and what I am wearing!)', 'Yes. The camera shows more than you think.'), x('Not worry. Nobody looks.', 'Everyone can see. Check first.')]),
      choose('You are emailing a teacher. Which is best?', null, [g('“Hello Ms Kelly, could you tell me when the project is due? Thank you, Sam.”', 'Greeting, clear question, thanks, name.'), x('“when is project due”', 'It is very short and a bit abrupt.')]),
      choose('You are about to press “Reply All” with a private joke.', null, [g('Stop! Reply All sends to everyone. Reply just to the person.', 'Check who it goes to before you send.'), x('Press Reply All. It is quicker.', 'Everyone would see it.')])] },
    { id: 'e-credit', emoji: '©️', title: 'Giving credit and asking permission', blurb: 'Using other people’s work fairly', min: 2, take: 'Say where things came from, ask before using other people’s work, and be honest about who helped, including AI.', steps: [
      choose('You want a picture for a school project. What is fair?', null, [g('Use pictures that are free to use, and say where they came from', 'Yes. Credit the creator.'), x('Copy any picture and say nothing', 'Someone made it. Give credit or choose free-to-use pictures.')]),
      choose('A classmate’s great answer is on a shared screen. Can you copy it?', null, [g('No. Do it in my own words, or ask for permission to use theirs and say so', 'Your own work is what teaches you.'), x('Yes, quickly paste it', 'That is copying, and it does not help you learn.')]),
      choose('An AI helper or a family member helped with part of your work.', null, [g('Say so honestly', 'Honesty about help is part of being trustworthy.'), x('Say I did it all myself', 'Being honest about help builds trust.')]),
      choose('You want to post your friend’s drawing to show people.', null, [g('Ask them first, and credit them', 'Their art, their choice.'), x('Post it. They will not mind.', 'Always ask first.')])] }
  ];

  SCENES.forEach(s => CA.items.kind.push({ id: s.id, emoji: s.emoji, title: s.title, blurb: s.blurb, min: s.min, route: '/kind/' + s.id }));
  CA.screens.kind = S.screen('kind', SCENES);
  CA.kindScenes = SCENES;
})();
