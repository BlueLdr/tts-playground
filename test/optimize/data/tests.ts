export const OPTIMIZE_TESTS = [
  {
    input: "|    this is a    sample message    ",
    action: "edit",
    output: "| this is a sample message",
  },
  {
    input: "|    this is a    sample message    ",
    action: "blur",
    output: "|this is a sample message",
  },

  {
    input: "  |  this is a    sample message    ",
    action: "edit",
    output: "| this is a sample message",
  },
  {
    input: "  |  this is a    sample message    ",
    action: "blur",
    output: "|this is a sample message",
  },

  {
    input: "    |this is a    sample message    ",
    action: "edit",
    output: "|this is a sample message",
  },
  {
    input: "    |this is a    sample message    ",
    action: "blur",
    output: "|this is a sample message",
  },

  {
    input: "    this is a|    sample message    ",
    action: "edit",
    output: "this is a| sample message",
  },
  {
    input: "    this is a|    sample message    ",
    action: "blur",
    output: "this is a| sample message",
  },

  {
    input: "    this is a  |  sample message    ",
    action: "edit",
    output: "this is a | sample message",
  },
  {
    input: "    this is a  |  sample message    ",
    action: "blur",
    output: "this is a| sample message",
  },

  {
    input: "    this is a    |sample message    ",
    action: "edit",
    output: "this is a |sample message",
  },
  {
    input: "    this is a    |sample message    ",
    action: "blur",
    output: "this is a |sample message",
  },

  {
    input: "    this is a    sample message|    ",
    action: "edit",
    output: "this is a sample message|",
  },
  {
    input: "    this is a    sample message|    ",
    action: "blur",
    output: "this is a sample message|",
  },

  {
    input: "    this is a    sample message  |  ",
    action: "edit",
    output: "this is a sample message |",
  },
  {
    input: "    this is a    sample message  |  ",
    action: "blur",
    output: "this is a sample message|",
  },

  {
    input: "    this is a    sample message    |",
    action: "edit",
    output: "this is a sample message |",
  },
  {
    input: "    this is a    sample message    |",
    action: "blur",
    output: "this is a sample message|",
  },

  {
    input: "    |you are   not right    ",
    action: "edit",
    output: "|u r not rite",
  },
  {
    input: "    |you are   not right    ",
    action: "blur",
    output: "|u r not rite",
  },

  {
    input: "    yo|u are   not right    ",
    action: "edit",
    output: "yo|u r not rite",
  },
  {
    input: "    yo|u are   not right    ",
    action: "blur",
    output: "u| r not rite",
  },

  {
    input: "|you are   not right    ",
    action: "edit",
    output: "|u r not rite",
  },
  {
    input: "|you are   not right    ",
    action: "blur",
    output: "|u r not rite",
  },

  {
    input: "yo|u are   not right    ",
    action: "edit",
    output: "yo|u r not rite",
  },
  {
    input: "yo|u are   not right    ",
    action: "blur",
    output: "u| r not rite",
  },

  {
    input: "you| are   not right    ",
    action: "edit",
    output: "you| r not rite",
  },
  {
    input: "you| are   not right    ",
    action: "blur",
    output: "u| r not rite",
  },

  {
    input: "    you |are   not right    ",
    action: "edit",
    output: "u |r not rite",
  },
  {
    input: "    you |are   not right    ",
    action: "blur",
    output: "u |r not rite",
  },

  {
    input: "    you a|re   not right    ",
    action: "edit",
    output: "u a|re not rite",
  },
  {
    input: "    you a|re   not right    ",
    action: "blur",
    output: "u r| not rite",
  },

  {
    input: "    you are|   not right    ",
    action: "edit",
    output: "u are| not rite",
  },
  {
    input: "    you are|   not right    ",
    action: "blur",
    output: "u r| not rite",
  },

  {
    input: "    you are   not |right    ",
    action: "edit",
    output: "u r not |rite",
  },
  {
    input: "    you are   not |right    ",
    action: "blur",
    output: "u r not |rite",
  },

  {
    input: "    you are   not ri|ght    ",
    action: "edit",
    output: "u r not ri|ght",
  },
  {
    input: "    you are   not ri|ght    ",
    action: "blur",
    output: "u r not ri|te",
  },

  {
    input: "    you are   not right|    ",
    action: "edit",
    output: "u r not right|",
  },
  {
    input: "    you are   not right|    ",
    action: "blur",
    output: "u r not rite|",
  },

  {
    input: "    you are   not |right",
    action: "edit",
    output: "u r not |rite",
  },
  {
    input: "    you are   not |right",
    action: "blur",
    output: "u r not |rite",
  },

  {
    input: "    you are   not ri|ght",
    action: "edit",
    output: "u r not ri|ght",
  },
  {
    input: "    you are   not ri|ght",
    action: "blur",
    output: "u r not ri|te",
  },

  {
    input: "    you are   not right|",
    action: "edit",
    output: "u r not right|",
  },
  {
    input: "    you are   not right|",
    action: "blur",
    output: "u r not rite|",
  },

  {
    input: "    you |are,not right    ",
    action: "edit",
    output: "u |r,not rite",
  },
  {
    input: "    you |are,not right    ",
    action: "blur",
    output: "u |r,not rite",
  },

  {
    input: "    you a|re,not right    ",
    action: "edit",
    output: "u a|re,not rite",
  },
  {
    input: "    you a|re,not right    ",
    action: "blur",
    output: "u r|,not rite",
  },

  {
    input: "    you are|,not right    ",
    action: "edit",
    output: "u are|,not rite",
  },
  {
    input: "    you are|,not right    ",
    action: "blur",
    output: "u r|,not rite",
  },
  {
    input: "    you,|are   not right    ",
    action: "edit",
    output: "u,|r not rite",
  },
  {
    input: "    you,|are   not right    ",
    action: "blur",
    output: "u,|r not rite",
  },

  {
    input: "    you,a|re   not right    ",
    action: "edit",
    output: "u,a|re not rite",
  },
  {
    input: "    you,a|re   not right    ",
    action: "blur",
    output: "u,r| not rite",
  },

  {
    input: "    you,are|   not right    ",
    action: "edit",
    output: "u,are| not rite",
  },
  {
    input: "    you,are|   not right    ",
    action: "blur",
    output: "u,r| not rite",
  },

  {
    input: "    you | are   not right    ",
    action: "edit",
    output: "u | r not rite",
  },
  {
    input: "    you | are   not right    ",
    action: "blur",
    output: "u| r not rite",
  },
];

const all_message =
  "  one guy two guy three four five guy six guy  and seven guy, eight   guy nine guy ten guy for guy, before you go, make sure you don't speak too quick alright? goodnight!  forget about it. we make big cookie for to bring customer back. foursome at the forefront. they've gotta go?  reeeeaaaiiiiiiuiiiiglloooooyyyyy  ";

export const OPTIMIZE_LEVEL_TESTS = [
  {
    input: all_message,
    level: "safe",
    output:
      "1guy2guy3 4 5guy6guy&7guy,8guy9guy10guy for guy,before you go,make sure you don't speak2quick alrite?goodnite!forget about it. we make big cookie for to bring customer back. foursome at the forefront. they've gotta go?reeaaiiuiigllooyy",
  },
  {
    input: all_message,
    level: "normal",
    output:
      "1guy2guy3 4 5guy6guy&7guy,8guy9guy10guy for guy,before u go,make sure u don't speak2quick alrite?goodnite!forget about it. we make big cookie for to bring customer back. foursome at the forefront. theyve gotta go?reeaaiiuiigllooyy",
  },
  {
    input: all_message,
    level: "max",
    output:
      "1guy2guy3 4 5guy6guy&7guy,8guy9guy10guy4guy,be4u go,make sure u don't speak2quick alrite?goodnite! 4get about it. we make big cookie4 2bring customer back. 4some at the4front. theyve gotta go?reeaaiiuiigllooyy",
  },
];
