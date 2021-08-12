export const OPTIMIZE_TESTS = [
  {
    input: "|    this is a    sample message    ",
    action: "edit",
    output: "| þis isⓐsample message",
  },
  {
    input: "|    this is a    sample message    ",
    action: "blur",
    output: "|þis isⓐsample message",
  },

  {
    input: "  |  this is a    sample message    ",
    action: "edit",
    output: "| þis isⓐsample message",
  },
  {
    input: "  |  this is a    sample message    ",
    action: "blur",
    output: "|þis isⓐsample message",
  },

  {
    input: "    |this is a    sample message    ",
    action: "edit",
    output: "|þis isⓐsample message",
  },
  {
    input: "    |this is a    sample message    ",
    action: "blur",
    output: "|þis isⓐsample message",
  },

  {
    input: "    this is a|    sample message    ",
    action: "edit",
    output: "þis is a| sample message",
  },
  {
    input: "    this is a|    sample message    ",
    action: "blur",
    output: "þis isⓐ|sample message",
  },

  {
    input: "    this is a  |  sample message    ",
    action: "edit",
    output: "þis isⓐ | sample message",
  },
  {
    input: "    this is a  |  sample message    ",
    action: "blur",
    output: "þis isⓐ|sample message",
  },

  {
    input: "    this is a    |sample message    ",
    action: "edit",
    output: "þis isⓐ |sample message",
  },
  {
    input: "    this is a    |sample message    ",
    action: "blur",
    output: "þis isⓐ|sample message",
  },

  {
    input: "    this is a    sample message|    ",
    action: "edit",
    output: "þis isⓐsample message|",
  },
  {
    input: "    this is a    sample message|    ",
    action: "blur",
    output: "þis isⓐsample message|",
  },

  {
    input: "    this is a    sample message  |  ",
    action: "edit",
    output: "þis isⓐsample message |",
  },
  {
    input: "    this is a    sample message  |  ",
    action: "blur",
    output: "þis isⓐsample message|",
  },

  {
    input: "    this is a    sample message    |",
    action: "edit",
    output: "þis isⓐsample message |",
  },
  {
    input: "    this is a    sample message    |",
    action: "blur",
    output: "þis isⓐsample message|",
  },

  {
    input: "    |you are   not right    ",
    action: "edit",
    output: "|ⓤⓡnot rite",
  },
  {
    input: "    |you are   not right    ",
    action: "blur",
    output: "|ⓤⓡnot rite",
  },

  {
    input: "    yo|u are   not right    ",
    action: "edit",
    output: "yo|uⓡnot rite",
  },
  {
    input: "    yo|u are   not right    ",
    action: "blur",
    output: "ⓤ|ⓡnot rite",
  },

  {
    input: "|you are   not right    ",
    action: "edit",
    output: "|ⓤⓡnot rite",
  },
  {
    input: "|you are   not right    ",
    action: "blur",
    output: "|ⓤⓡnot rite",
  },

  {
    input: "yo|u are   not right    ",
    action: "edit",
    output: "yo|uⓡnot rite",
  },
  {
    input: "yo|u are   not right    ",
    action: "blur",
    output: "ⓤ|ⓡnot rite",
  },

  {
    input: "you| are   not right    ",
    action: "edit",
    output: "you| ⓡnot rite",
  },
  {
    input: "you| are   not right    ",
    action: "blur",
    output: "ⓤ|ⓡnot rite",
  },

  {
    input: "    you |are   not right    ",
    action: "edit",
    output: "ⓤ |ⓡnot rite",
  },
  {
    input: "    you |are   not right    ",
    action: "blur",
    output: "ⓤ|ⓡnot rite",
  },

  {
    input: "    you a|re   not right    ",
    action: "edit",
    output: "ⓤa|re not rite",
  },
  {
    input: "    you a|re   not right    ",
    action: "blur",
    output: "ⓤⓡ|not rite",
  },

  {
    input: "    you are|   not right    ",
    action: "edit",
    output: "ⓤare| not rite",
  },
  {
    input: "    you are|   not right    ",
    action: "blur",
    output: "ⓤⓡ|not rite",
  },

  {
    input: "    you are   not |right    ",
    action: "edit",
    output: "ⓤⓡnot |rite",
  },
  {
    input: "    you are   not |right    ",
    action: "blur",
    output: "ⓤⓡnot |rite",
  },

  {
    input: "    you are   not ri|ght    ",
    action: "edit",
    output: "ⓤⓡnot ri|ght",
  },
  {
    input: "    you are   not ri|ght    ",
    action: "blur",
    output: "ⓤⓡnot ri|te",
  },

  {
    input: "    you are   not right|    ",
    action: "edit",
    output: "ⓤⓡnot right|",
  },
  {
    input: "    you are   not right|    ",
    action: "blur",
    output: "ⓤⓡnot rite|",
  },

  {
    input: "    you are   not |right",
    action: "edit",
    output: "ⓤⓡnot |rite",
  },
  {
    input: "    you are   not |right",
    action: "blur",
    output: "ⓤⓡnot |rite",
  },

  {
    input: "    you are   not ri|ght",
    action: "edit",
    output: "ⓤⓡnot ri|ght",
  },
  {
    input: "    you are   not ri|ght",
    action: "blur",
    output: "ⓤⓡnot ri|te",
  },

  {
    input: "    you are   not right|",
    action: "edit",
    output: "ⓤⓡnot right|",
  },
  {
    input: "    you are   not right|",
    action: "blur",
    output: "ⓤⓡnot rite|",
  },

  {
    input: "    you |are,not right    ",
    action: "edit",
    output: "ⓤ |ⓡ,not rite",
  },
  {
    input: "    you |are,not right    ",
    action: "blur",
    output: "ⓤ|ⓡ,not rite",
  },

  {
    input: "    you a|re,not right    ",
    action: "edit",
    output: "ⓤa|re,not rite",
  },
  {
    input: "    you a|re,not right    ",
    action: "blur",
    output: "ⓤⓡ|,not rite",
  },

  {
    input: "    you are|,not right    ",
    action: "edit",
    output: "ⓤare|,not rite",
  },
  {
    input: "    you are|,not right    ",
    action: "blur",
    output: "ⓤⓡ|,not rite",
  },
  {
    input: "    you,|are   not right    ",
    action: "edit",
    output: "ⓤ,|ⓡnot rite",
  },
  {
    input: "    you,|are   not right    ",
    action: "blur",
    output: "ⓤ,|ⓡnot rite",
  },

  {
    input: "    you,a|re   not right    ",
    action: "edit",
    output: "ⓤ,a|re not rite",
  },
  {
    input: "    you,a|re   not right    ",
    action: "blur",
    output: "ⓤ,ⓡ|not rite",
  },

  {
    input: "    you,are|   not right    ",
    action: "edit",
    output: "ⓤ,are| not rite",
  },
  {
    input: "    you,are|   not right    ",
    action: "blur",
    output: "ⓤ,ⓡ|not rite",
  },

  {
    input: "    you | are   not right    ",
    action: "edit",
    output: "ⓤ | ⓡnot rite",
  },
  {
    input: "    you | are   not right    ",
    action: "blur",
    output: "ⓤ|ⓡnot rite",
  },
  {
    input: "$3 |is $3 man",
    action: "manual",
    output: "$3 |is $3 man",
  },
  {
    input: "$3 |a pop?",
    action: "manual",
    output: "$3|ⓐpop?",
  },
  {
    input: "how are you? i'm good|",
    action: "manual",
    output: "howⓡⓤ? i'm good|",
  },
  {
    input: "how are you? a lot better|",
    action: "manual",
    output: "howⓡⓤ?ⓐlot better|",
  },
];

export const SELECTION_TESTS = [
  {
    input: "  you | ar|e   not right    ",
    output: "  you |ar|e   not right    ",
  },
  {
    input: "  you,| ar|e   not right    ",
    output: "  you,|ar|e   not right    ",
  },
  {
    input: "  you | are |  not right    ",
    output: "  you |ⓡ|  not right    ",
  },
  {
    input: "  you  |are   not right |   ",
    output: "  you  |ⓡnot rite|   ",
  },
  {
    input: "Do not send| this message to the |streamer.",
    output: "Do not send| þis message2 þe |streamer.",
  },
];

const all_message =
  "  one guy two guy three four five guy six guy  and seven guy, eight   guy nine guy ten guy for guy, " +
  "before you go, make sure you don't speak too quick alright? goodnight!  forget about it. " +
  "you boys be aight. we make big cookie for to bring customer back. foursome at the forefront. " +
  "none of that fluff. i know no fear. come at me bro. can't you see why you are a goob? " +
  "they've gotta go? YOU ARE WHY you are why yOu aRe whY You Are Why THEY've I'VE who'VE you'Ve we'vE " +
  "alrIGHT alRiGhT alRIght. NOT THE BEES. speedy fast boi. I'm not your mate, matey." +
  "þat sucks.   reeeeaaaiiiiiiuiiiiglloooooyyyyy  ";

export const OPTIMIZE_LEVEL_TESTS = [
  {
    input: all_message,
    level: "safe",
    output:
      "1guy2guy3 4 5guy6guy&7guy,8guy9guy10guy for guy," +
      "before you go,make sure you don't speak2quick alrite?goodnite!forget about it. " +
      "you boysⓑaite. we make big cookie for to bring cuﬆomer back. foursome@ þe forefront. " +
      "none of þat ﬂuff. ⓘknow № fear. come@me bro. can't you see why you are a goob? " +
      "þey've gotta go?YOU ARE WHY you are why yOu aRe whY You Are Why ÞEY've I'VE who'VE you'Ve we'vE " +
      "alrITE alRiTe alRIte. NOT ÞE B'S. speedy faﬆ boi. I'm not your mate,matey. " +
      "þat sucks. reeaaiiuiigllooyy",
  },
  {
    input: all_message,
    level: "normal",
    output:
      "1guy2guy3 4 5guy6guy&7guy,8guy9guy10guy for guy," +
      "b4ⓤgo,make sureⓤdon't speak2quick alrite?goodnite!forget about it. " +
      "ⓤboysⓑaite. we make big cookie for to bring cuﬆomer back. foursome@ þe forefront. " +
      "nun of þat ﬂuff. ⓘ № № fear. come@me bro. can'tⓤⓒⓨⓤⓡa goob? " +
      "þeyve gotta go?ⓊⓇⓎⓤⓡⓨⓤⓡⓨⓊⓇⓎÞEYve IVE whoVE youVe wevE " +
      "alrITE alRiTe alRIte. NOT ÞE B'S. speeⓓfaﬆ boi. I'm not your 􃎜8, 􃎜80. " +
      "þat sucks. reeaaiiuiigllooyy",
  },
  {
    input: all_message,
    level: "max",
    output:
      "1guy2guy3 4 5guy6guy&7guy,8guy9guy10guy4guy," +
      "b4ⓤgo,make sureⓤdon't speak2quick alrite?goodnite! 4get about it. " +
      "ⓤboysⓑaite. we make big cookie4 2bring cuﬆomer back. 4some@ þe4front. " +
      "nun of þat ﬂuff. ⓘ № № fear. come@me bro. can'tⓤⓒⓨⓤⓡⓐgoob? " +
      "þeyve gotta go?ⓊⓇⓎⓤⓡⓨⓤⓡⓨⓊⓇⓎÞEYve IVE whoVE youVe wevE " +
      "alrITE alRiTe alRIte. NOT ÞE B'S. speeⓓfaﬆ boi. I'm not your 􃎜8, 􃎜80. " +
      "þat sucks. reeaaiiuiigllooyy",
  },
];
