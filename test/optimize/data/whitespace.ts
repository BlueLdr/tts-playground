export const WHITESPACE_TESTS = [
  {
    input: "| \nwow he caught  it  ",
    action: "blur",
    output: "|wow he caught it",
  },
  {
    input: "| \nwow he caught  it  ",
    action: "edit",
    output: "|\nwow he caught it",
  },
  {
    input: "|\nwow he caught  it  ",
    action: "blur",
    output: "|wow he caught it",
  },
  {
    input: "|\nwow he caught  it  ",
    action: "edit",
    output: "|\nwow he caught it",
  },
  {
    input: " |\nwow he caught  it  ",
    action: "blur",
    output: "|wow he caught it",
  },
  {
    input: " |\nwow he caught  it  ",
    action: "edit",
    output: "|\nwow he caught it",
  },
  {
    input: "\n|wow he caught  it  ",
    action: "blur",
    output: "|wow he caught it",
  },
  {
    input: "\n|wow he caught  it  ",
    action: "edit",
    output: "|wow he caught it",
  },
  {
    input: "\n |wow he caught  it  ",
    action: "blur",
    output: "|wow he caught it",
  },
  {
    input: "\n |wow he caught  it  ",
    action: "edit",
    output: "|wow he caught it",
  },
  {
    input: " \n|wow he caught  it  ",
    action: "blur",
    output: "|wow he caught it",
  },
  {
    input: " \n|wow he caught  it  ",
    action: "edit",
    output: "|wow he caught it",
  },
  {
    input: "|wow he\ncaught  it  ",
    action: "blur",
    output: "|wow he\ncaught it",
  },
  {
    input: "|wow he\ncaught  it  ",
    action: "edit",
    output: "|wow he\ncaught it",
  },
  {
    input: "|wow he \ncaught  it  ",
    action: "blur",
    output: "|wow he\ncaught it",
  },
  {
    input: "|wow he \ncaught  it  ",
    action: "edit",
    output: "|wow he\ncaught it",
  },
  {
    input: "|wow he\n caught  it  ",
    action: "blur",
    output: "|wow he\ncaught it",
  },
  {
    input: "|wow he\n caught  it  ",
    action: "edit",
    output: "|wow he\ncaught it",
  },
  {
    input: "|wow he \n caught  it  ",
    action: "blur",
    output: "|wow he\ncaught it",
  },
  {
    input: "|wow he \n caught  it  ",
    action: "edit",
    output: "|wow he\ncaught it",
  },
  {
    input: "wow he|\ncaught  it  ",
    action: "blur",
    output: "wow he|\ncaught it",
  },
  {
    input: "wow he|\ncaught  it  ",
    action: "edit",
    output: "wow he|\ncaught it",
  },
  {
    input: "wow he| \ncaught  it  ",
    action: "blur",
    output: "wow he|\ncaught it",
  },
  {
    input: "wow he| \ncaught  it  ",
    action: "edit",
    output: "wow he|\ncaught it",
  },
  {
    input: "wow he|\n caught  it  ",
    action: "blur",
    output: "wow he|\ncaught it",
  },
  {
    input: "wow he|\n caught  it  ",
    action: "edit",
    output: "wow he|\ncaught it",
  },
  {
    input: "wow he| \n caught  it  ",
    action: "blur",
    output: "wow he|\ncaught it",
  },
  {
    input: "wow he| \n caught  it  ",
    action: "edit",
    output: "wow he|\ncaught it",
  },
  {
    input: "wow he |\n caught  it  ",
    action: "blur",
    output: "wow he|\ncaught it",
  },
  {
    input: "wow he |\n caught  it  ",
    action: "edit",
    output: "wow he |\ncaught it",
  },
  {
    input: "wow he\n|caught  it  ",
    action: "blur",
    output: "wow he\n|caught it",
  },
  {
    input: "wow he\n|caught  it  ",
    action: "edit",
    output: "wow he\n|caught it",
  },
  {
    input: "wow he \n|caught  it  ",
    action: "blur",
    output: "wow he\n|caught it",
  },
  {
    input: "wow he \n|caught  it  ",
    action: "edit",
    output: "wow he\n|caught it",
  },
  {
    input: "wow he\n| caught  it  ",
    action: "blur",
    output: "wow he\n|caught it",
  },
  {
    input: "wow he\n| caught  it  ",
    action: "edit",
    output: "wow he\n| caught it",
  },
  {
    input: "wow he \n| caught  it  ",
    action: "blur",
    output: "wow he\n|caught it",
  },
  {
    input: "wow he \n| caught  it  ",
    action: "edit",
    output: "wow he\n| caught it",
  },
  {
    input: "wow he\n |caught  it  ",
    action: "blur",
    output: "wow he\n|caught it",
  },
  {
    input: "wow he\n |caught  it  ",
    action: "edit",
    output: "wow he\n|caught it",
  },
  {
    input: "wow he \n |caught  it  ",
    action: "blur",
    output: "wow he\n|caught it",
  },
  {
    input: "wow he \n |caught  it  ",
    action: "edit",
    output: "wow he\n|caught it",
  },
  {
    input: " wow he caught|  it\n  ",
    action: "blur",
    output: "wow he caught| it",
  },
  {
    input: " wow he caught|  it\n  ",
    action: "edit",
    output: "wow he caught| it",
  },
  {
    input: "wow he caught|  it \n ",
    action: "blur",
    output: "wow he caught| it",
  },
  {
    input: "wow he caught|  it \n ",
    action: "edit",
    output: "wow he caught| it",
  },
  {
    input: "wow he caught|  it  \n",
    action: "blur",
    output: "wow he caught| it",
  },
  {
    input: "wow he caught|  it  \n",
    action: "edit",
    output: "wow he caught| it",
  },
  {
    input: " wow he caught  it|\n  ",
    action: "blur",
    output: "wow he caught it|",
  },
  {
    input: " wow he caught  it|\n  ",
    action: "edit",
    output: "wow he caught it|",
  },
  {
    input: "wow he caught  it| \n ",
    action: "blur",
    output: "wow he caught it|",
  },
  {
    input: "wow he caught  it| \n ",
    action: "edit",
    output: "wow he caught it|",
  },
  {
    input: "wow he caught  it|  \n",
    action: "blur",
    output: "wow he caught it|",
  },
  {
    input: "wow he caught  it|  \n",
    action: "edit",
    output: "wow he caught it|",
  },
  {
    input: " wow he caught  it\n|  ",
    action: "blur",
    output: "wow he caught it|",
  },
  {
    input: " wow he caught  it\n|  ",
    action: "edit",
    output: "wow he caught it\n|",
  },
  {
    input: "wow he caught  it |\n ",
    action: "blur",
    output: "wow he caught it|",
  },
  {
    input: "wow he caught  it |\n ",
    action: "edit",
    output: "wow he caught it |",
  },
  {
    input: "wow he caught  it  |\n",
    action: "blur",
    output: "wow he caught it|",
  },
  {
    input: "wow he caught  it  |\n",
    action: "edit",
    output: "wow he caught it |",
  },
  {
    input: "wow he caught  it \n| ",
    action: "blur",
    output: "wow he caught it|",
  },
  {
    input: "wow he caught  it \n| ",
    action: "edit",
    output: "wow he caught it\n|",
  },
  {
    input: "wow he caught  it  |\n",
    action: "blur",
    output: "wow he caught it|",
  },
  {
    input: "wow he caught  it  |\n",
    action: "edit",
    output: "wow he caught it |",
  },
  {
    input: "wow he caught  it  \n|",
    action: "blur",
    output: "wow he caught it|",
  },
  {
    input: "wow he caught  it  \n|",
    action: "edit",
    output: "wow he caught it\n|",
  },
  {
    input: "wow he caught  it \n |",
    action: "blur",
    output: "wow he caught it|",
  },
  {
    input: "wow he caught  it \n |",
    action: "edit",
    output: "wow he caught it\n|",
  },
  {
    input: "wow he caught  it  \n|",
    action: "blur",
    output: "wow he caught it|",
  },
  {
    input: "wow he caught  it  \n|",
    action: "edit",
    output: "wow he caught it\n|",
  },
];

export const TRIM_WHITESPACE_TESTS = [
  {
    input: " \n wow \n |he  caught  it \n ",
    output: "wow\n|he caught it",
  },
  {
    input: "| \n wow he  caught   it  ",
    output: "|wow he caught it",
  },
  {
    input: " | \n wow he  caught   it  ",
    output: "|wow he caught it",
  },
  {
    input: "\n |wow he  caught   it  ",
    output: "|wow he caught it",
  },
  {
    input: " |wow he \n caught   it  ",
    output: "|wow he\ncaught it",
  },
  {
    input: " wow he| \n caught   it  ",
    output: "wow he|\ncaught it",
  },
  {
    input: " wow he \n| caught   it  ",
    output: "wow he\n|caught it",
  },
  {
    input: " wow he \n caught   it | ",
    output: "wow he\ncaught it|",
  },
  {
    input: " wow he  caught   it | \n ",
    output: "wow he caught it|",
  },
  {
    input: " wow he  caught   it \n |",
    output: "wow he caught it|",
  },
];
