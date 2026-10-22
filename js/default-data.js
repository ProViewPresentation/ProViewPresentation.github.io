/* ============================================================
   PROVIEW — DEFAULT SANCTUARY DATABASE & SERVICE DATA
============================================================ */

window.PROVIEW_DEFAULTS = {
  DataVersion: "2.1",

  churchProfile: {
    churchName: "Grace Sanctuary Fellowship",
    ccliLicense: "CCLI #11482903",
    defaultTranslation: "ESV",
    defaultMaxCharsPerSlide: 150,
    globalFontSize: 28
  },

  backgrounds: [
    {
      id: "bg-sanctuary-amber",
      name: "Warm Sanctuary Gold",
      type: "Gradient",
      css: "radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.55) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(217, 119, 6, 0.45) 0%, transparent 55%), linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #090d16 100%)"
    },
    {
      id: "bg-deep-worship",
      name: "Midnight Deep Blue",
      type: "Gradient",
      css: "radial-gradient(circle at 75% 25%, rgba(56, 189, 248, 0.45) 0%, transparent 50%), radial-gradient(circle at 25% 75%, rgba(99, 102, 241, 0.45) 0%, transparent 55%), linear-gradient(160deg, #060913 0%, #0f172a 60%, #1e1b4b 100%)"
    },
    {
      id: "bg-cathedral-emerald",
      name: "Living Water Emerald",
      type: "Gradient",
      css: "radial-gradient(circle at 30% 70%, rgba(16, 185, 129, 0.42) 0%, transparent 55%), radial-gradient(circle at 70% 20%, rgba(14, 165, 233, 0.38) 0%, transparent 50%), linear-gradient(135deg, #041311 0%, #0b212d 60%, #090d16 100%)"
    },
    {
      id: "bg-crimson-cross",
      name: "Communion Crimson",
      type: "Gradient",
      css: "radial-gradient(circle at 50% 25%, rgba(239, 68, 68, 0.42) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.35) 0%, transparent 50%), linear-gradient(145deg, #18080c 0%, #1f1224 60%, #090d16 100%)"
    },
    {
      id: "bg-sermon-clean",
      name: "Sermon Slate Minimal",
      type: "Gradient",
      css: "radial-gradient(circle at 85% 15%, rgba(148, 163, 184, 0.2) 0%, transparent 45%), linear-gradient(180deg, #0f172a 0%, #090d16 100%)"
    },
    {
      id: "bg-youth-neon",
      name: "Youth Horizon",
      type: "Gradient",
      css: "radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.55) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.5) 0%, transparent 50%), linear-gradient(135deg, #090514 0%, #1e1b4b 100%)"
    }
  ],

  songs: [
    {
      id: "song-10000-reasons",
      title: "10,000 Reasons (Bless the Lord)",
      authors: "Jonas Myrin, Matt Redman",
      ccliSongNumber: "6016351",
      copyright: "© 2011 Thankyou Music",
      key: "G Major",
      bpm: "73 BPM",
      defaultBg: "bg-sanctuary-amber",
      stageNotes: "Key of G • 73 BPM • Acoustic guitar starts solo on Chorus.",
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
      authors: "Sinach",
      ccliSongNumber: "7115744",
      copyright: "© 2016 Integrity Music",
      key: "E Major",
      bpm: "68 BPM",
      defaultBg: "bg-deep-worship",
      stageNotes: "Key of E • 68 BPM • Warm pad intro, build on Bridge.",
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
          lyrics: "Even when I don't see it, You're working\nEven when I don't feel it, You're working\nYou never stop, You never stop working"
        }
      ]
    },
    {
      id: "song-goodness-of-god",
      title: "Goodness of God",
      authors: "Jenn Johnson, Ed Cash, Brian Johnson",
      ccliSongNumber: "7117726",
      copyright: "© 2018 Bethel Music",
      key: "Ab Major",
      bpm: "63 BPM",
      defaultBg: "bg-cathedral-emerald",
      stageNotes: "Key of Ab • 63 BPM • Soft vocal cue before Chorus.",
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
          lyrics: "Your goodness is running after, it's running after me\nWith my life laid down, I'm surrendered now, I give You everything\nYour goodness is running after, it's running after me"
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
        KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. For God sent not his Son into the world to condemn the world; but that the world through him might be saved.",
        NLT: "For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life. God sent his Son into the world not to judge the world, but to save the world through him."
      }
    },
    {
      reference: "Psalm 23:1-6",
      translations: {
        ESV: "The LORD is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for his name's sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
        NIV: "The LORD is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul. He guides me along the right paths for his name's sake. Even though I walk through the darkest valley, I will fear no evil, for you are with me.",
        KJV: "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.",
        NLT: "The LORD is my shepherd; I have all that I need. He lets me rest in green meadows; he leads me beside peaceful streams. He renews my strength."
      }
    },
    {
      reference: "Romans 8:31-39",
      translations: {
        ESV: "What then shall we say to these things? If God is for us, who can be against us? He who did not spare his own Son but gave him up for us all, how will he not also with him graciously give us all things? For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, will be able to separate us from the love of God in Christ Jesus our Lord.",
        NIV: "What, then, shall we say in response to these things? If God is for us, who can be against us? For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, will be able to separate us from the love of God that is in Christ Jesus our Lord.",
        KJV: "What shall we then say to these things? If God be for us, who can be against us? For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, shall be able to separate us from the love of God.",
        NLT: "What shall we say about such wonderful things as these? If God is for us, who can ever be against us? And I am convinced that nothing can ever separate us from God's love."
      }
    },
    {
      reference: "Isaiah 40:28-31",
      translations: {
        ESV: "Have you not known? Have you not heard? The LORD is the everlasting God, the Creator of the ends of the earth. He does not faint or grow weary; his understanding is unsearchable. He gives power to the faint, and to him who has no might he increases strength. But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
        NIV: "Do you not know? Have you not heard? The LORD is the everlasting God, the Creator of the ends of the earth. He will not grow tired or weary. Those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
        KJV: "Hast thou not known? hast thou not heard, that the everlasting God, the LORD, the Creator of the ends of the earth, fainteth not, neither is weary? But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles.",
        NLT: "Have you never heard? Have you never understood? The LORD is the everlasting God, the Creator of all the earth. But those who trust in the LORD will find new strength. They will soar high on wings like eagles."
      }
    }
  ],

  services: [
    {
      id: "service-sunday-morning",
      title: "Sunday Morning Service",
      date: "Sunday • 9:30 AM",
      leadPastor: "Pastor David Vance",
      items: [
        {
          id: "item-sermon-series",
          type: "sermon",
          title: "Sermon: Unshakeable Hope",
          subtitle: "4 Sermon Slides • Pastor David Vance",
          bgId: "bg-sermon-clean",
          stageNotes: "Pastor David • 35:00 message timer • Isaiah 40 anchor text",
          slides: [
            {
              id: "s-serm-1",
              label: "Title Slide",
              text: "UNSHAKEABLE HOPE\n\"Strength in the Waiting\"\nPastor David Vance",
              bgId: "bg-sermon-clean",
              fontScale: 100
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
              text: "2. Waiting on the Lord Is Active Trust\nBiblical waiting is not passive—it is anchored expectation in God's promises.",
              bgId: "bg-sermon-clean",
              fontScale: 100
            },
            {
              id: "s-serm-4",
              label: "Point 3 & Call",
              text: "3. He Renews Those Who Wait Upon Him\n\"They shall mount up with wings like eagles; they shall run and not be weary.\"",
              bgId: "bg-cathedral-emerald",
              fontScale: 100
            }
          ]
        },
        {
          id: "item-song-1",
          type: "song",
          title: "10,000 Reasons (Bless the Lord)",
          subtitle: "Music Lyrics • Key of G • 73 BPM",
          ccliSongNumber: "6016351",
          authors: "Jonas Myrin, Matt Redman",
          key: "G Major",
          bpm: "73 BPM",
          bgId: "bg-sanctuary-amber",
          stageNotes: "Key: G Major • 73 BPM • Acoustic guitar starts solo on Chorus.",
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
          title: "Isaiah 40:28-31 (ESV)",
          subtitle: "Scripture Reading • 3 Slides",
          bgId: "bg-deep-worship",
          stageNotes: "Congregation stands for the Scripture reading.",
          slides: [
            {
              id: "s-isa-1",
              label: "Isaiah 40:28 (ESV)",
              text: "Have you not known? Have you not heard? The LORD is the everlasting God, the Creator of the ends of the earth. He does not faint or grow weary.",
              bgId: "bg-deep-worship",
              fontScale: 100
            },
            {
              id: "s-isa-2",
              label: "Isaiah 40:29-30 (ESV)",
              text: "He gives power to the faint, and to him who has no might he increases strength. Even youths shall faint and be weary, and young men shall fall exhausted;",
              bgId: "bg-deep-worship",
              fontScale: 100
            },
            {
              id: "s-isa-3",
              label: "Isaiah 40:31 (ESV)",
              text: "but they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
              bgId: "bg-deep-worship",
              fontScale: 100
            }
          ]
        },
        {
          id: "item-welcome-video",
          type: "video",
          singular: true,
          title: "Service Welcome & Countdown Video",
          subtitle: "Video • 03:00 Duration",
          duration: 180,
          videoStyle: "countdown",
          bgId: "bg-sanctuary-amber",
          stageNotes: "Band takes stage when video countdown reaches 0:45.",
          slides: [
            {
              id: "s-vid-1",
              label: "Video Feed",
              text: "Welcome to Grace Sanctuary\nService Begins Soon",
              bgId: "bg-sanctuary-amber",
              fontScale: 100
            }
          ]
        },
        {
          id: "item-baptism-video",
          type: "video",
          singular: true,
          title: "Baptism Sunday Highlight Video",
          subtitle: "Video • 02:15 Duration",
          duration: 135,
          videoStyle: "testimony",
          bgId: "bg-cathedral-emerald",
          stageNotes: "Play during baptism transition. House lights dim to 25%.",
          slides: [
            {
              id: "s-vid-2",
              label: "Video Feed",
              text: "Baptism Sunday Stories\nRaised to Walk in Newness of Life",
              bgId: "bg-cathedral-emerald",
              fontScale: 100
            }
          ]
        },
        {
          id: "item-welcome-graphic",
          type: "media",
          singular: true,
          title: "Welcome Graphic (Single Slide)",
          subtitle: "Singular Graphic • Static Title Card",
          bgId: "bg-deep-worship",
          stageNotes: "Hold on screen during lobby dismissal.",
          slides: [
            {
              id: "s-med-1",
              label: "Graphic",
              text: "Welcome Home to Grace Sanctuary\nWe're glad you're worshipping with us today",
              bgId: "bg-deep-worship",
              fontScale: 105
            }
          ]
        },
        {
          id: "item-song-closing",
          type: "song",
          title: "Way Maker",
          subtitle: "Music Lyrics • Key of E • 68 BPM",
          ccliSongNumber: "7115744",
          authors: "Sinach",
          key: "E Major",
          bpm: "68 BPM",
          bgId: "bg-deep-worship",
          stageNotes: "Key: E Major • 68 BPM • Transition from Pastor David's closing prayer.",
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
              fontScale: 100
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
      date: "Friday • 6:30 PM",
      leadPastor: "Pastor Caleb Rivera",
      items: [
        {
          id: "yn-item-video",
          type: "video",
          singular: true,
          title: "Youth Night Opener Video",
          subtitle: "Video • 01:30 Duration",
          duration: 90,
          videoStyle: "youth",
          bgId: "bg-youth-neon",
          stageNotes: "High energy intro video.",
          slides: [
            {
              id: "yn-s-1",
              label: "Video Feed",
              text: "YOUTH NIGHT LIVE\nWelcome Students!",
              bgId: "bg-youth-neon",
              fontScale: 110
            }
          ]
        },
        {
          id: "yn-item-2",
          type: "song",
          title: "Goodness of God",
          subtitle: "Music Lyrics • Key of Ab • 63 BPM",
          ccliSongNumber: "7117726",
          authors: "Jenn Johnson, Ed Cash, Brian Johnson",
          key: "Ab Major",
          bpm: "63 BPM",
          bgId: "bg-youth-neon",
          stageNotes: "Key: Ab Major • 63 BPM • Student worship band.",
          slides: [
            {
              id: "yn-s-2",
              label: "Verse 1",
              text: "I love You, Lord, Oh Your mercy never fails me\nAll my days, I've been held in Your hands\nFrom the moment that I wake up until I lay my head\nI will sing of the goodness of God",
              bgId: "bg-youth-neon",
              fontScale: 100
            },
            {
              id: "yn-s-2b",
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
          subtitle: "Scripture Reading • 2 Slides",
          bgId: "bg-deep-worship",
          stageNotes: "Small group discussion verse.",
          slides: [
            {
              id: "yn-s-3",
              label: "John 3:16 (NLT)",
              text: "For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.",
              bgId: "bg-deep-worship",
              fontScale: 100
            },
            {
              id: "yn-s-4",
              label: "John 3:17 (NLT)",
              text: "God sent his Son into the world not to judge the world, but to save the world through him.",
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
      date: "Wednesday • 7:00 PM",
      leadPastor: "Pastor David Vance",
      items: [
        {
          id: "mw-item-1",
          type: "scripture",
          title: "Psalm 23:1-6 (ESV)",
          subtitle: "Scripture Reading • 2 Slides",
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
