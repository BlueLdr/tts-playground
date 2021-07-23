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
