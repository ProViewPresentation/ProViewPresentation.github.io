/* ============================================================
   PROVIEW — DEFAULT SANCTUARY DATABASE & SCRIPTURE ENGINE DATA
============================================================ */

window.PROVIEW_DEFAULTS = {
  churchProfile: {
    churchName: "Grace Sanctuary Fellowship",
    ccliLicense: "CCLI #11482903",
    defaultTranslation: "ESV",
    defaultMaxCharsPerSlide: 150,
    stagePinCode: "7742",
    globalFontSize: 28,
    aspectRatio: "16:9 (1080p60 Broadcast)"
  },

  backgrounds: [
    {
      id: "bg-sanctuary-amber",
      name: "Sanctuary Gold Rays",
      type: "motion-gradient",
      css: "radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.55) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(217, 119, 6, 0.45) 0%, transparent 55%), linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #090d16 100%)"
    },
    {
      id: "bg-deep-worship",
      name: "Midnight Nebula Loop",
      type: "motion-gradient",
      css: "radial-gradient(circle at 75% 25%, rgba(56, 189, 248, 0.45) 0%, transparent 50%), radial-gradient(circle at 25% 75%, rgba(99, 102, 241, 0.45) 0%, transparent 55%), linear-gradient(160deg, #060913 0%, #0f172a 60%, #1e1b4b 100%)"
    },
    {
      id: "bg-cathedral-emerald",
      name: "Living Water Emerald",
      type: "motion-gradient",
      css: "radial-gradient(circle at 30% 70%, rgba(16, 185, 129, 0.42) 0%, transparent 55%), radial-gradient(circle at 70% 20%, rgba(14, 165, 233, 0.38) 0%, transparent 50%), linear-gradient(135deg, #041311 0%, #0b212d 60%, #090d16 100%)"
    },
    {
      id: "bg-crimson-cross",
      name: "Communion Ember",
      type: "motion-gradient",
      css: "radial-gradient(circle at 50% 25%, rgba(239, 68, 68, 0.42) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.35) 0%, transparent 50%), linear-gradient(145deg, #18080c 0%, #1f1224 60%, #090d16 100%)"
    },
    {
      id: "bg-sermon-clean",
      name: "Sermon Slate Minimal",
      type: "motion-gradient",
      css: "radial-gradient(circle at 85% 15%, rgba(148, 163, 184, 0.2) 0%, transparent 45%), linear-gradient(180deg, #0f172a 0%, #090d16 100%)"
    },
    {
      id: "bg-youth-neon",
      name: "Youth Night Horizon",
      type: "motion-gradient",
      css: "radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.55) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.5) 0%, transparent 50%), linear-gradient(135deg, #090514 0%, #1e1b4b 100%)"
    }
  ],

  songs: [
    {
      id: "song-10000-reasons",
      title: "10,000 Reasons (Bless the Lord)",
      authors: "Jonas Myrin, Matt Redman",
      ccliSongNumber: "6016351",
      copyright: "© 2011 Thankyou Music / Said And Done Music",
      key: "G Major",
      bpm: "73 BPM",
      defaultBg: "bg-sanctuary-amber",
      stageNotes: "Acoustic guitar starts solo on Chorus. Full band enters on Verse 1.",
      sections: [
        {
          label: "Chorus",
          lyrics: "Bless the Lord, O my soul, O my soul\nWorship His holy name\nSing like never before, O my soul\nI'll worship Your holy name"
        },
        {
          label: "Verse 1",
          lyrics: "The sun comes up, it's a new day dawning\nIt's time to sing Your song again\nWhatever may pass and whatever lies before me\nLet me be singing when the evening comes"
        },
        {
          label: "Verse 2",
          lyrics: "You're rich in love and You're slow to anger\nYour name is great and Your heart is kind\nFor all Your goodness I will keep on singing\nTen thousand reasons for my heart to find"
        },
        {
          label: "Verse 3",
          lyrics: "And on that day when my strength is failing\nThe end draws near and my time has come\nStill my soul will sing Your praise unending\nTen thousand years and then forevermore"
        }
      ]
    },
    {
      id: "song-way-maker",
      title: "Way Maker",
      authors: "Osinachi Kalu Okoro Egbu (Sinach)",
      ccliSongNumber: "7115744",
      copyright: "© 2016 Integrity Music",
      key: "E Major",
      bpm: "68 BPM",
      defaultBg: "bg-deep-worship",
      stageNotes: "Warm pad intro. Keep dynamics intimate on Verse 1, build on Bridge.",
      sections: [
        {
          label: "Verse 1",
          lyrics: "You are here, moving in our midst\nI worship You, I worship You\nYou are here, working in this place\nI worship You, I worship You"
        },
        {
          label: "Chorus",
          lyrics: "Way Maker, Miracle Worker, Promise Keeper\nLight in the darkness\nMy God, that is who You are"
        },
        {
          label: "Verse 2",
          lyrics: "You are here, touching every heart\nI worship You, I worship You\nYou are here, healing every heart\nI worship You, I worship You"
        },
        {
          label: "Bridge",
          lyrics: "Even when I don't see it, You're working\nEven when I don't feel it, You're working\nYou never stop, You never stop working\nYou never stop, You never stop working"
        }
      ]
    },
    {
      id: "song-goodness-of-god",
      title: "Goodness of God",
      authors: "Ben Fielding, Brian Johnson, Ed Cash, Jason Ingram, Jenn Johnson",
      ccliSongNumber: "7117726",
      copyright: "© 2018 Bethel Music Publishing",
      key: "Ab Major",
      bpm: "63 BPM",
      defaultBg: "bg-cathedral-emerald",
      stageNotes: "Worship leader vocal cue before Chorus repeat.",
      sections: [
        {
          label: "Verse 1",
          lyrics: "I love You, Lord, Oh Your mercy never fails me\nAll my days, I've been held in Your hands\nFrom the moment that I wake up until I lay my head\nI will sing of the goodness of God"
        },
        {
          label: "Chorus",
          lyrics: "All my life You have been faithful\nAll my life You have been so, so good\nWith every breath that I am able\nI will sing of the goodness of God"
        },
        {
          label: "Bridge",
          lyrics: "Your goodness is running after, it's running after me\nYour goodness is running after, it's running after me\nWith my life laid down, I'm surrendered now, I give You everything\nYour goodness is running after, it's running after me"
        }
      ]
    },
    {
      id: "song-amazing-grace",
      title: "Amazing Grace (Traditional Hymn)",
      authors: "John Newton (1779)",
      ccliSongNumber: "22025",
      copyright: "Public Domain",
      key: "D Major",
      bpm: "70 BPM",
      defaultBg: "bg-crimson-cross",
      stageNotes: "Congregational a cappella on final verse.",
      sections: [
        {
          label: "Verse 1",
          lyrics: "Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see."
        },
        {
          label: "Verse 2",
          lyrics: "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed."
        },
        {
          label: "Verse 3",
          lyrics: "When we've been there ten thousand years,\nBright shining as the sun,\nWe've no less days to sing God's praise\nThan when we'd first begun."
        }
      ]
    }
  ],

  scriptureLibrary: [
    {
      reference: "John 3:16-18",
      translations: {
        ESV: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life. For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him. Whoever believes in him is not condemned, but whoever does not believe is condemned already, because he has not believed in the name of the only Son of God.",
        NIV: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. For God did not send his Son into the world to condemn the world, but to save the world through him. Whoever believes in him is not condemned, but whoever does not believe stands condemned already because they have not believed in the name of God's one and only Son.",
        KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. For God sent not his Son into the world to condemn the world; but that the world through him might be saved. He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.",
        NLT: "For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life. God sent his Son into the world not to judge the world, but to save the world through him. There is no judgment against anyone who believes in him."
      }
    },
    {
      reference: "Psalm 23:1-6",
      translations: {
        ESV: "The LORD is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for his name's sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me. You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows. Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the LORD forever.",
        NIV: "The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along the right paths for his name's sake. Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me. You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows. Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the LORD forever.",
        KJV: "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me. Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over. Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.",
        NLT: "The LORD is my shepherd; I have all that I need. He lets me rest in green meadows; he leads me beside peaceful streams. He renews my strength. He guides me along right paths, bringing honor to his name. Even when I walk through the darkest valley, I will not be afraid, for you are close beside me. Your rod and your staff protect and comfort me."
      }
    },
    {
      reference: "Romans 8:31-39",
      translations: {
        ESV: "What then shall we say to these things? If God is for us, who can be against us? He who did not spare his own Son but gave him up for us all, how will he not also with him graciously give us all things? Who shall bring any charge against God's elect? It is God who justifies. Who is to condemn? Christ Jesus is the one who died—more than that, who was raised—who is at the right hand of God, who indeed is interceding for us. For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers, nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord.",
        NIV: "What, then, shall we say in response to these things? If God is for us, who can be against us? He who did not spare his own Son, but gave him up for us all—how will he not also, along with him, graciously give us all things? For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.",
        KJV: "What shall we then say to these things? If God be for us, who can be against us? He that spared not his own Son, but delivered him up for us all, how shall he not with him also freely give us all things? For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.",
        NLT: "What shall we say about such wonderful things as these? If God is for us, who can ever be against us? Since he did not spare even his own Son but gave him up for us all, won't he also give us everything else? And I am convinced that nothing can ever separate us from God's love."
      }
    },
    {
      reference: "Isaiah 40:28-31",
      translations: {
        ESV: "Have you not known? Have you not heard? The LORD is the everlasting God, the Creator of the ends of the earth. He does not faint or grow weary; his understanding is unsearchable. He gives power to the faint, and to him who has no might he increases strength. Even youths shall faint and be weary, and young men shall fall exhausted; but they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
        NIV: "Do you not know? Have you not heard? The LORD is the everlasting God, the Creator of the ends of the earth. He will not grow tired or weary, and his understanding no one can fathom. He gives strength to the weary and increases the power of the weak. Even youths grow tired and weary, and young men stumble and fall; but those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
        KJV: "Hast thou not known? hast thou not heard, that the everlasting God, the LORD, the Creator of the ends of the earth, fainteth not, neither is weary? there is no searching of his understanding. He giveth power to the faint; and to them that have no might he increaseth strength. But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
        NLT: "Have you never heard? Have you never understood? The LORD is the everlasting God, the Creator of all the earth. He never grows weak or weary. No one can measure the depths of his understanding. He gives power to the weak and strength to the powerless. But those who trust in the LORD will find new strength. They will soar high on wings like eagles."
      }
    },
    {
      reference: "Philippians 4:4-8",
      translations: {
        ESV: "Rejoice in the Lord always; again I will say, rejoice. Let your reasonableness be known to everyone. The Lord is at hand; do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus. Finally, brothers, whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable, if there is any excellence, if there is anything worthy of praise, think about these things.",
        NIV: "Rejoice in the Lord always. I will say it again: Rejoice! Let your gentleness be evident to all. The Lord is near. Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
        KJV: "Rejoice in the Lord alway: and again I say, Rejoice. Let your moderation be known unto all men. The Lord is at hand. Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
        NLT: "Always be full of joy in the Lord. I say it again—rejoice! Let everyone see that you are considerate in all you do. Remember, the Lord is coming soon. Don't worry about anything; instead, pray about everything. Tell God what you need, and thank him for all he has done."
      }
    }
  ],

  services: [
    {
      id: "service-sunday-morning",
      title: "Sunday Morning Traditional",
      date: "Sunday • 9:30 AM & 11:00 AM",
      leadPastor: "Pastor David Vance",
      techDirector: "Sarah Jenkins",
      items: [
        {
          id: "item-welcome",
          type: "media",
          title: "Pre-Service Welcome & 5-Min Countdown",
          subtitle: "Sanctuary Gold Rays • Motion Loop",
          bgId: "bg-sanctuary-amber",
          stageNotes: "House lights at 60%. Band takes stage at 0:45 remaining.",
          slides: [
            {
              id: "s-wel-1",
              label: "Welcome Loop",
              text: "Welcome to Grace Sanctuary\nSunday Morning Worship Gathering\nFind your seats — service begins shortly",
              bgId: "bg-sanctuary-amber",
              fontScale: 100
            },
            {
              id: "s-wel-2",
              label: "Announcements",
              text: "Midweek Bible Study — Wednesdays at 7:00 PM\nYouth Night — Fridays at 6:30 PM in the Student Center",
              bgId: "bg-sanctuary-amber",
              fontScale: 100
            }
          ]
        },
        {
          id: "item-song-1",
          type: "song",
          title: "10,000 Reasons (Bless the Lord)",
          subtitle: "CCLI #6016351 • Jonas Myrin, Matt Redman",
          ccliSongNumber: "6016351",
          authors: "Jonas Myrin, Matt Redman",
          bgId: "bg-sanctuary-amber",
          stageNotes: "Key of G • 73 BPM • Acoustic guitar starts solo on Chorus.",
          slides: [
            {
              id: "s-10k-1",
              label: "Chorus",
              text: "Bless the Lord, O my soul, O my soul\nWorship His holy name\nSing like never before, O my soul\nI'll worship Your holy name",
              bgId: "bg-sanctuary-amber",
              fontScale: 100
            },
            {
              id: "s-10k-2",
              label: "Verse 1",
              text: "The sun comes up, it's a new day dawning\nIt's time to sing Your song again\nWhatever may pass and whatever lies before me\nLet me be singing when the evening comes",
              bgId: "bg-sanctuary-amber",
              fontScale: 100
            },
            {
              id: "s-10k-3",
              label: "Verse 2",
              text: "You're rich in love and You're slow to anger\nYour name is great and Your heart is kind\nFor all Your goodness I will keep on singing\nTen thousand reasons for my heart to find",
              bgId: "bg-sanctuary-amber",
              fontScale: 100
            },
            {
              id: "s-10k-4",
              label: "Verse 3",
              text: "And on that day when my strength is failing\nThe end draws near and my time has come\nStill my soul will sing Your praise unending\nTen thousand years and then forevermore",
              bgId: "bg-sanctuary-amber",
              fontScale: 100
            }
          ]
        },
        {
          id: "item-scripture-reading",
          type: "scripture",
          title: "Scripture Reading: Isaiah 40:28-31 (ESV)",
          subtitle: "Instant Scripture Engine • Auto-Reflowed (3 Sub-Slides)",
          bgId: "bg-deep-worship",
          stageNotes: "Congregation stands for the reading of God's Word.",
          slides: [
            {
              id: "s-isa-1",
              label: "Isaiah 40:28 (ESV)",
              text: "Have you not known? Have you not heard? The LORD is the everlasting God, the Creator of the ends of the earth. He does not faint or grow weary; his understanding is unsearchable.",
              bgId: "bg-deep-worship",
              fontScale: 95
            },
            {
              id: "s-isa-2",
              label: "Isaiah 40:29-30 (ESV)",
              text: "He gives power to the faint, and to him who has no might he increases strength. Even youths shall faint and be weary, and young men shall fall exhausted;",
              bgId: "bg-deep-worship",
              fontScale: 95
            },
            {
              id: "s-isa-3",
              label: "Isaiah 40:31 (ESV)",
              text: "but they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
              bgId: "bg-deep-worship",
              fontScale: 95
            }
          ]
        },
        {
          id: "item-sermon-series",
          type: "sermon",
          title: "Sermon Collection: Unshakeable Hope (Part 3)",
          subtitle: "Nested Sermon Folder • 4 Presentation Slides + Scripture",
          bgId: "bg-sermon-clean",
          stageNotes: "Pastor David • 35:00 segment timer. Trigger lower-thirds for online NDI feed.",
          slides: [
            {
              id: "s-serm-1",
              label: "Series Title",
              text: "UNSHAKEABLE HOPE — PART 3\n\"Strength in the Waiting\"\nPastor David Vance • Isaiah 40 & Romans 8",
              bgId: "bg-sermon-clean",
              fontScale: 105
            },
            {
              id: "s-serm-2",
              label: "Point 1",
              text: "1. God's Perspective Outlasts Our Exhaustion\nOur weariness is real, but His everlasting strength is never depleted.",
              bgId: "bg-sermon-clean",
              fontScale: 100
            },
            {
              id: "s-serm-3",
              label: "Point 2",
              text: "2. Waiting on the Lord Is Active Trust\nBiblical waiting is not passive boredom—it is anchored expectation in God's promises.",
              bgId: "bg-sermon-clean",
              fontScale: 100
            },
            {
              id: "s-serm-4",
              label: "Key Quote / Call",
              text: "\"When you cannot run, He carries you; when you wait upon Him, He renews you.\"\n— Reflection & Altar Response",
              bgId: "bg-cathedral-emerald",
              fontScale: 100
            }
          ]
        },
        {
          id: "item-song-closing",
          type: "song",
          title: "Way Maker",
          subtitle: "CCLI #7115744 • Sinach • Response Worship",
          ccliSongNumber: "7115744",
          authors: "Osinachi Kalu Okoro Egbu (Sinach)",
          bgId: "bg-deep-worship",
          stageNotes: "Transition directly from Pastor David's prayer in E Major.",
          slides: [
            {
              id: "s-wm-1",
              label: "Verse 1",
              text: "You are here, moving in our midst\nI worship You, I worship You\nYou are here, working in this place\nI worship You, I worship You",
              bgId: "bg-deep-worship",
              fontScale: 100
            },
            {
              id: "s-wm-2",
              label: "Chorus",
              text: "Way Maker, Miracle Worker, Promise Keeper\nLight in the darkness\nMy God, that is who You are",
              bgId: "bg-deep-worship",
              fontScale: 105
            },
            {
              id: "s-wm-3",
              label: "Bridge",
              text: "Even when I don't see it, You're working\nEven when I don't feel it, You're working\nYou never stop, You never stop working",
              bgId: "bg-deep-worship",
              fontScale: 100
            }
          ]
        }
      ]
    },
    {
      id: "service-youth-night",
      title: "Youth Night",
      date: "Friday • 6:30 PM Student Sanctuary",
      leadPastor: "Pastor Caleb Rivera",
      techDirector: "Liam Chen",
      items: [
        {
          id: "yn-item-1",
          type: "media",
          title: "Youth Night Hype Countdown",
          subtitle: "Youth Night Horizon Loop",
          bgId: "bg-youth-neon",
          stageNotes: "High energy lobby walk-in music.",
          slides: [
            {
              id: "yn-s-1",
              label: "Welcome",
              text: "YOUTH NIGHT LIVE\nWelcome Students! Grab a seat up front!",
              bgId: "bg-youth-neon",
              fontScale: 110
            }
          ]
        },
        {
          id: "yn-item-2",
          type: "song",
          title: "Goodness of God",
          subtitle: "CCLI #7117726 • Bethel Music",
          ccliSongNumber: "7117726",
          authors: "Jenn Johnson, Ed Cash, Brian Johnson",
          bgId: "bg-youth-neon",
          stageNotes: "Full student worship band.",
          slides: [
            {
              id: "yn-s-2",
              label: "Chorus",
              text: "All my life You have been faithful\nAll my life You have been so, so good\nWith every breath that I am able\nI will sing of the goodness of God",
              bgId: "bg-youth-neon",
              fontScale: 100
            }
          ]
        },
        {
          id: "yn-item-3",
          type: "scripture",
          title: "John 3:16-17 (NLT)",
          subtitle: "Instant Scripture Engine",
          bgId: "bg-deep-worship",
          stageNotes: "Small group breakout prompt after verse.",
          slides: [
            {
              id: "yn-s-3",
              label: "John 3:16 (NLT)",
              text: "For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.",
              bgId: "bg-deep-worship",
              fontScale: 100
            }
          ]
        }
      ]
    },
    {
      id: "service-midweek",
      title: "Midweek Bible Study",
      date: "Wednesday • 7:00 PM Fellowship Hall",
      leadPastor: "Pastor David Vance",
      techDirector: "Volunteer Operator",
      items: [
        {
          id: "mw-item-1",
          type: "scripture",
          title: "Psalm 23:1-6 Study (ESV)",
          subtitle: "Verse-by-Verse Exposition",
          bgId: "bg-cathedral-emerald",
          stageNotes: "Interactive Q&A after Slide 2.",
          slides: [
            {
              id: "mw-s-1",
              label: "Psalm 23:1-3 (ESV)",
              text: "The LORD is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul.",
              bgId: "bg-cathedral-emerald",
              fontScale: 100
            },
            {
              id: "mw-s-2",
              label: "Psalm 23:4 (ESV)",
              text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
              bgId: "bg-cathedral-emerald",
              fontScale: 100
            }
          ]
        }
      ]
    }
  ]
};
