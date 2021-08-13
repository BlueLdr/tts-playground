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
